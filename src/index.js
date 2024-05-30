// =======================================================
// 瀑布流布局
// =======================================================

// 初始化数据
var mainBody = document.querySelector('.waterfall');
var orderWidth = Number(mainBody.dataset.width);
var rowgap = Number(mainBody.dataset.rowgap);
var colgap = Number(mainBody.dataset.colgap);
var firstLoad = true;

// 获取图片数据
var imageList = mainBody.children;
var imageHeightList = [];
for (var i = 0; i < imageList.length; i++) {
  imageHeightList[imageList[i].dataset.name] = imageList[i].dataset.imageheight / (imageList[i].dataset.imagewidth / orderWidth);
}

// 位置匹配函数
function setPosition(element, arrIndex, arrHeight) {
  element.style.left = (arrIndex * (orderWidth + rowgap)) + 'px';
  element.style.top = arrHeight + 'px';
}

// 获取高度
function getHeight(arr) {
  var minHeight = arr[0];
  var minIndex = 0;
  var maxHeight = arr[0];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < minHeight) {
      minHeight = arr[i];
      minIndex = i;
    } else if (arr[i] > maxHeight) {
      maxHeight = arr[i];
    }
  }
  return { minHeight, minIndex, maxHeight };
}

// 瀑布流布局函数
var contentWidth = document.querySelector('#bodyContent').clientWidth;
var columns = Math.floor(contentWidth / orderWidth);
var imageCountTag = document.querySelector('.image-count');

function waterfallApply() {
  var columnsHeightArr = [];
  var columnsHeightArr = [];
  var colcount = 0;
  var counter = 0;
  for (var i = 0; i < imageList.length; i++) {
    if (firstLoad || imageList[i].offsetHeight !== 0) {
      // 布局判断
      if (colcount < columns) {
        setPosition(imageList[i], colcount, 0);
        columnsHeightArr[colcount] = imageHeightList[imageList[i].dataset.name] + colgap;
        colcount++;
      } else {
        var { minIndex, minHeight } = getHeight(columnsHeightArr);
        setPosition(imageList[i], minIndex, minHeight);
        columnsHeightArr[minIndex] = columnsHeightArr[minIndex] + imageHeightList[imageList[i].dataset.name] + colgap;
      }
      counter++;
    } else {
      // 跳过过滤的图片(display:none)
      continue
    }
  }
  imageCountTag.innerText = counter;
  // 设置主体高度
  var { maxHeight } = getHeight(columnsHeightArr);
  mainBody.style.height = maxHeight + 'px';
}

// 窗口自适应
window.addEventListener('resize', function () {
  contentWidth = document.querySelector('#bodyContent').clientWidth;
  if (columns !== Math.floor(contentWidth / orderWidth)) {
    columns = Math.floor(contentWidth / orderWidth);
    waterfallApply();
  }
});

// 切换过滤器时重新渲染
for (var i = 0; i < document.querySelectorAll('.tabber-filter-item').length; i++) {
  document.querySelectorAll('.tabber-filter-item')[i].addEventListener('click', waterfallApply);
}

// 首次加载
waterfallApply();
firstLoad = false;

// =======================================================
// 角色搜索器
// =======================================================

// 处理数据
var imageCharacterList = {};
for (var i = 0; i < imageList.length; i++) {
  if (imageList[i].dataset.character) {
    imageCharacterList[imageList[i].dataset.name] = imageList[i].dataset.character.split(',');
  }
}

var characterPramas = document.querySelector('.character-params').children;
var characterList = {};
for (var i = 0; i < characterPramas.length; i++) {
  if (characterPramas[i].dataset.nickname) {
    var characterNickname = characterList[characterPramas[i].dataset.name];
    if (characterNickname) {
      var temp = characterPramas[i].dataset.nickname.split(',');
      for (var j = 0; j < temp.length; j++) {
        if (!inArray(characterNickname, temp[j])) {
          characterNickname.push(temp[j])
        }
      }
    } else {
      characterList[characterPramas[i].dataset.name] = characterPramas[i].dataset.nickname.split(',');
    }
  }
}
var tabber = document.querySelector('.tabber');
var characterDiv = document.querySelector('.character-params');
tabber.removeChild(characterDiv);

// 判断数据是否在数组内
function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (value === array[i]) {
      return true
    }
  }
  return false
}

// 搜索函数
function searchCharacter() {
  var searchContent = searchInput.value;

  if (searchContent.replace(/\s*/,'')) {
    for (var i = 0; i < imageList.length; i++) {
      var characterName = searchContent;
      // 判断角色俗称
      for (var key in characterList) {
        for (var j = 0; j < characterList[key].length; j++) {
          if (searchContent === characterList[key][j]) {
            characterName = key
          }
        }
      }

      // 判断图片是否包含搜索角色
      var checkArr = imageCharacterList[imageList[i].dataset.name] || [];
      var inCharacterList = checkArr.some(function(item) {
        return (item === characterName)
      });

      // 显示 / 隐藏（display:none会与tabber功能冲突）
      if (inCharacterList) {
        imageList[i].style.width = 'auto';
        imageList[i].style.height = 'auto';
      } else {
        imageList[i].style.width = 0;
        imageList[i].style.height = 0;
      }
    }
    waterfallApply();
  }
}

// 重置函数
function resetSearchResult() {
  searchInput.value = '';
  for (var i = 0; i < imageList.length; i++) {
    imageList[i].style.width = 'auto';
    imageList[i].style.height = 'auto';
  }
  waterfallApply();
}

// 渲染页面
var searchTag = document.querySelector('.search-tag');

var searchInput = searchTag.appendChild(document.createElement('input'));
searchInput.placeholder = '输入查询的角色名';
searchInput.classList.add('search-input');
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchCharacter()
  }
});

var searchButton = searchTag.appendChild(document.createElement('button'));
searchButton.innerText = '搜索';
searchButton.classList.add('search-button');
searchButton.addEventListener('click', searchCharacter);


var resetButton = searchTag.appendChild(document.createElement('button'));
resetButton.innerText = '重置';
resetButton.classList.add('search-button');
resetButton.addEventListener('click', resetSearchResult);