const
  bgColor = ['sienna', 'burlywood'],
  plrColor = ['' ,'wheat', '#500000'],
  visibility = {
    true  : 'visible',
    false : 'hidden'
  }

let
  fields = []
  //Фишки: кол-во, цвет, возможность хода
  map = [],
  mapC = [],
  mapP = [],
  dice = [],
  story = [], //История хода
  home = [],
  homeP = [],
  homeCans = []

let
  plr = 2,
  sel = 0
  
  //Заготовка точек
let
  dots = []
  dots[0] = []
  dots[1] = [[0.5, 0.5]];var home = [], homeP = []
  var homeCans = []
  dots[2] = [[0.2, 0.8], [0.8, 0.2]]
  dots[3] = [[0.5, 0.5], [0.25, 0.75], [0.75, 0.25]]
  dots[4] = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]]
  dots[5] = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75], [0.5, 0.5]]
  dots[6] = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75], [0.5, 0.25], [0.5, 0.75]]
  
let
  dropBtn = document.getElementById('drop'),
  dBStyle = dropBtn.style,
  $home1 = document.getElementById('home1'),
  $home2 = document.getElementById('home2'),
  $top = document.querySelector('.top'),
  $bottom = document.querySelector('.bottom');

function newElem(s) {
  return document.createElement(s)
}

//Единица поля
class Field {
  constructor(i) {
    let td = newElem('td')
    td.id = i
    td.onclick = function(event) { select(i) }
    if (i < 13) {
      $top.appendChild(td)
    } else {
      $bottom.appendChild(td)
    }
    let can = newElem('canvas')
    td.appendChild(can)
    
    this.td = td
    this.can = can
    this.index = i
  }
    
  redraw() {
    draw(this.index, this.can, map[this.index], mapC[this.index])
    this.td.classList.remove('selected',
    'possible1', 'possible2', 'possible3', 'possible4')
    if (deep(mapP[this.index])) {
      this.td.classList.add('possible' + deep(mapP[this.index]))
    }
  }
}

/*Генерация поля!*/
function generateHtml() {
  for (let i = 12, j = 13; i > 0; i--, j++) {
    fields[i] = new Field(i) //top
    fields[j] = new Field(j) //bottom
    //Перегородка
    if (i == 7) {
      let el = newElem('td')
      el.setAttribute('rowspan', 2)
      el.classList.add('dark')
      el.style = "border: 1px solid"
      $top.appendChild(el)
    }
  }
  
  //Создание canvas'ов
  homeCans[1] = newElem('canvas');
  $home1.appendChild(homeCans[1]);
  
  homeCans[2] = newElem('canvas');
  $home2.appendChild(homeCans[2]);
}
generateHtml();

window.onresize = function(event) {
  refresh();
};

//Новая игра
function newGame() {
  for (let i = 1; i < 25; i++) {
    map[i] = 0
    mapC[i] = 0
    mapP[i] = [0, 0, 0, 0, 0] //Возможность каждого кубика (1, 2, 3, 4)
  }
  map[1] = 15
  mapC[1] = 1
  map[13] = 15
  mapC[13] = 2
  dice = [0, 0, 0, 0, 0]
  
  story[0] = 1; //Индекс пустого значения
  for (let i = 1; i < 5; i++){
    story[i] = [0, 0]
  }
  
  home[1] = -1 //0 = в домике
  home[2] = -1
  homeP[1] = [0, 0, 0, 0, 0]
  homeP[2] = [0, 0, 0, 0, 0]
}

/*Перерисовка*/
function refresh()
{
  drawField();
  drawDice();
  drawDrop();
  checkWin();
}

/*Победа!*/
function checkWin()
{
  if (home[plr] == 15){
    alert('Победа Игрока' + plr);
  }
}

/*Отображение кнопки Броска*/
function drawDrop()
{
  //Цвет кости
  dBStyle.backgroundColor = plrColor[plr % 2 + 1];
  dBStyle.visibility = visibility[!deep(dice)];
}

/*Отображение кубиков*/
function drawDice()
{
  for (let i = 1; i < 5; i++){
  
    canvas = document.querySelector('#dice' + i + ' canvas');
    
    //Рисунок на кости
    w = document.body.clientWidth * 0.07;
    canvas.width = w;
    canvas.height = w;
    
    let dc = document.querySelector('#dice' + i);
    dc.style.visibility = visibility[Boolean(dice[i])]

    if (dice[i]) {
    
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = plrColor[plr % 2 + 1];
      for (let d = 0; d < dice[i]; d++){
        var dot = dots[dice[i]][d];
        drawTrick (ctx, dot[0] * w, dot[1] * w, w / 10);
      }
      
      //Цвет кости
      if (plr == 1) {
        dc.classList.remove("black");
        dc.classList.add("white");
      } else {
        dc.classList.remove("white");
        dc.classList.add("black");
      }
    }
  }
}

/*Отрисовка поля*/
function drawField()
{
  for (let i = 1; i < 25; i++) {
    fields[i].redraw();
  }
  
  var el = document.getElementById('home' + plr)
  el.classList.remove('selected',
  'possible1', 'possible2', 'possible3', 'possible4');
    if (deep(homeP[plr])) {
      el.classList.add('possible' + deep(homeP[plr]));
    }
  
  draw(0, homeCans[1], home[1], 1);
  draw(0, homeCans[2], home[2], 2);
  //Выделенный элемент
  if (sel) {
    document.getElementById(sel).classList.add('selected');
  }
}

/*Отображение глубины хода*/
function drawDeepHome()
{
  if (home[plr] >= 0) {
    var elField = document.querySelector('#home' + plr);
    elField.classList.remove('possible1', 'possible2', 'possible3', 'possible4');
    if (deep(homeP[plr])) {
      elField.classList.add('possible' + deep(homeP[plr]));
    }
  }
}

/*Отрисовка канвы*/
function draw(i, canvas, count, colorN){
  var w = document.body.clientWidth / 15;
  var h = document.body.clientHeight * 13 / 30;
  if (i == 0) h *= 2;
  canvas.width = w;
  canvas.height = h;
  
  var kX = (((h - w) / 15) + ((16 * w - h) / 15) * (1 - (count / 15))**3);
  var ctx = canvas.getContext("2d");
  
  //Цвет фона
  if (i) {
    ctx.fillStyle = bgColor[0];
    if (i % 2 == 1) {
      ctx.fillStyle = bgColor[1];
    }
    drawTriangle(ctx, w, h);
  }
  
  if (count) 
  {
      ctx.fillStyle = plrColor[colorN];
      for (let k = 0; k < count; k++){
        drawTrick(ctx, w / 2, k * kX + (w / 2), w / 2 - 2);
      }
  
      //Подпись количества
      ctx.fillStyle = plrColor[colorN % 2 + 1];
      drawCount(ctx, w / 2 - ('' + count).length * 10, (count - 1) * kX + (w / 2) + 10, count);
  }    
}

/*Треугольник*/
function drawTriangle (ctx, w, h)
{
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w / 2, h);
  ctx.lineTo(w, 0);
  ctx.fill();
  ctx.closePath();
  ctx.stroke();
}

/*Фишка*/
function drawTrick (ctx, x, y, r)
{
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.fill()
  ctx.closePath();
  ctx.stroke();
}

function drawCount(ctx, x, y, count)
{
  ctx.beginPath();
  ctx.font = "italic 20pt Arial";
  ctx.fillText(count, x, y);
  ctx.closePath();
  ctx.stroke();
}

/*Клик*/
function select(id) {
  if (deep(dice) == 0) { return 0 };
  id = Number(id);
  //Выбор хода
  if (deep(mapP[id])) {
    move(sel, id);
    return;
  }

  //Выбор позиции
  if ((sel != id) && (selectAbility(id))) {
      clearPossibility();
      sel = id;
      //Проверка возможных ходов
      var x = [0, dice[1], dice[2], dice[3], dice[4]];
      trace(x, sel);
  } else
  clearPossibility();
  refresh();
}

/*Очистка массивов возможностей*/
function clearPossibility()
{
  for (let i = 1; i < 25; i++)
  {
    mapP[i] = [0, 0, 0, 0, 0];
    if (map[i] == 0) {mapC[i] = 0};
  }
  homeP[1] = [0, 0, 0, 0, 0];
  homeP[2] = [0, 0, 0, 0, 0];
  sel = 0;
}

/*Возможность выбора клетки*/
function selectAbility(i)
{
  if ((map[i] == 0) || (mapC[i] != plr) || (sel == i)) {
    return 0;
  }
  if (i == (plr - 1) * 12 + 1)
    for (let j = 1; j < story[0]; j++)
    {
      if (story[j][0] == i)
      {
        return 0;
      }
    }
  return 1;
}

/*Определение глубины клетки*/
function deep(map){
  return (map[1] + map[2] + map[3] + map[4])
}

/*Ход*/
function move(from, to) {
  
  mapC[to] = plr;
  map[to]++;
  map[from]--;
  
  story[story[0]++] = [from, to];
  
  //Обнуление кубика, запись хода в историю
  for (let i = 1; i < 5; i++){
    dice[i] = dice[i] * (1 - mapP[to][i]);
  }
  //Сброс выделения
  clearPossibility();
  
  refresh();
  fullAbility();
}

/*Ход в дом*/
function moveHome()
{
  if (deep(homeP[plr]) == 0) return;
  
  home[plr]++;
  map[sel]--;
  
  story[story[0]++] = [sel, 0];
  
  //Обнуление кубика, запись хода в историю
  for (let i = 1; i < 5; i++){
    dice[i] = dice[i] * (1 - homeP[plr][i]);
  }
  //Сброс выделения
  clearPossibility();
  refresh();
  fullAbility();
}

/*Бросок*/
function drop(){
  dice[1] = 1 + Math.floor(Math.random() * 6);
  dice[2] = 6 - Math.floor(Math.random() * 6);
  //Дубль
  if (dice[1] == dice[2]){
    dice[3] = dice[1];
    dice[4] = dice[1];
  }
  //Смена игрока
  plr = plr % 2 + 1;
  //Сброс истории
  story[0] = 1;

  checkHome();
  refresh();
  fullAbility();  
}

/* Отслеживание состояний домиков */
function checkHome() {
  if (home[plr] == -1){
    for (let i = 1; i < 19; i++){
      var point = i + (plr - 1) * 12;
      point = (point - 1) % 24 + 1;
      if (mapC[point] == plr) {
        if (map[point]){ //Найдена фишка за домиком
          return 0;
        }
      }
    }
    home[plr] = 0;
  }
}

/*Проверка возможности хода*/
function fullAbility() {

  var x = [0, dice[1], dice[2], dice[3], dice[4]];
  for (let i = 1; i < 25; i++){
    if (selectAbility(i))
      if (trace(x, i)){
        clearPossibility();
        return 1;
      }
  }
  //Сброс выделения
  clearPossibility();
  alert('Ход невозможен! Кубики: ' + dice[1] + ' и ' + dice[2]);
  dice = [0, 0, 0, 0, 0];
  refresh();
  return 0;
}

/*Трассировка*/
function trace(x, point){

  var flag = [0, 0, 0, 0, 0, 0, 0]; //flag[0] = сумма остальных
  
  if (deep(x) == 0) {return 1;}
  else

  for (let i = 1; i < 5; i++){
    if (x[i] && (flag[x[i]] == 0)) {
      var newP = (point + x[i] - 1) % 24 + 1;
      var newHomePoint = (point + x[i]) - ((plr % 2 + 1) * 12);
      
      if (traceAbility(point, newP)) {
        flag[x[i]]++;
        var y = [0, x[1], x[2], x[3], x[4]];
        y[i] = 0;
        mapP[newP][1] = (mapP[newP][1] || mapP[point][1]);
        mapP[newP][2] = (mapP[newP][2] || mapP[point][2]);
        mapP[newP][3] = (mapP[newP][3] || mapP[point][3]);
        mapP[newP][4] = (mapP[newP][4] || mapP[point][4]);
        mapP[newP][i] = 1;
        flag[0] += 1 + trace(y, newP);
      }
      
      if (home[plr] >= 0){
        if (newHomePoint == 1){
          flag[x[i]]++;
          flag[0]++;
          homeP[plr][1] = (mapP[point][1]);
          homeP[plr][2] = (mapP[point][2]);
          homeP[plr][3] = (mapP[point][3]);
          homeP[plr][4] = (mapP[point][4]);
          homeP[plr][i] = 1;
        } else
        if (newHomePoint > 1){
          if (checkBefore(point) == 0){
            flag[x[i]]++;
            flag[0]++;
            homeP[plr] = [0, 0, 0, 0, 0];
            homeP[plr][i] = 1;
          }
        }
      
      }
    }
    
  }
  
  return flag[0];
}

function checkBefore(point)
{
  for (let i = point - 6; i < point; i++){
    if ((mapC[i] == plr) && (map[i])){
      return 1;
    }
  }
  return 0;
}


/* Возможность трассировочного хода */
function traceAbility(from, to) {
  if (mapC[to] == plr % 2 + 1) {
    return 0;
  }
  if (plr == 1){
    if ((from >= 19) && (to < 7)) {
      return 0;
    }
  } else {
    if ((from >= 7) && (from < 13)) {
      if (to >= 13) {
        return 0;
      }
    }
  }
  return 1;
}

newGame();
refresh();