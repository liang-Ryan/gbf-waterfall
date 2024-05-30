local p = {}
-- 通用
local getArgs = require('Module:Arguments').getArgs
local OrderedTable = require('Module:OrderedTable')

------------------------------------------------------------
-- 获取数据
------------------------------------------------------------

function p.query_data()
  -- 查询数据
  local query
  query = {
    ['_id'] = { ["$regex"] = '^Data:贺图.tabx' },
  }
  local imageOption = {
    ['projection'] = {
      ['filename'] = 1,
      ['year'] = 1,
      ['category'] = 1,
      ['image_width'] = 1,
      ['image_height'] = 1,
      ['character'] = 1,
    },
  }
  local imageResult = mw.huiji.db.find(query, imageOption)
  table.sort(imageResult, p.sort_images)
  
  query = {
    ['_id'] = { ["$regex"] = '^Data:角色列表.tabx' },
  }
  local characterOption = {
    ['projection'] = {
      ['name_chs'] = 1,
      ['nickname'] = 1,
      ['search_nickname'] = 1,
    }
  }
  local characterResult = mw.huiji.db.find(query, characterOption)

  -- 整理数据
  local imageOutput = {}
  for _, images_info in ipairs(imageResult) do
    table.insert(imageOutput, images_info)
  end

  local characterOutput = {}
  for _, characterInfo_info in ipairs(characterResult) do
    table.insert(characterOutput, characterInfo_info)
  end

  return imageOutput, characterOutput
end

function p.sort_images(a, b)
  local a_index = tonumber(mw.text.split(a._id, '#')[2])
  local b_index = tonumber(mw.text.split(b._id, '#')[2])
  return a_index < b_index
end

------------------------------------------------------------
-- 生成页面
------------------------------------------------------------
function p.main(frame)
  local args = getArgs(frame)
  local category = mw.text.split(args.category, ',')
  local year = mw.text.split(args.year, ',')

  local html = mw.html.create()

  -- 生成过滤器
  local tabber = html:tag('div'):addClass('tabber element-any')
  local table = tabber:tag('table'):addClass('wikitable ec text-center'):attr('style', 'font-size:14px; margin: 20px 5px;')
                     
  local category_row = table:tag('tr')
  local table_head = category_row:tag('th'):attr('rowspan', 3):wikitext('分类')
  local category_filter = category_row:tag('td')
                                      :tag('div'):addClass('tabber-filter auto-first ec-btn justify-start')
  local category_first_button = category_filter:tag('div'):addClass('tabber-filter-item ec-1-bd selected'):attr('data-type', 'all'):attr('style', 'width:65px'):wikitext('全部')
  for _, item in ipairs(category) do
    category_filter:tag('div'):addClass('tabber-filter-item multi-choice ec-1-bd'):attr('data-type', 'category'):attr('data-category', item):attr('style', 'width:65px'):wikitext(item)
  end
  local category_last_button = category_filter:tag('div'):addClass('tabber-filter-item multi-choice ec-1-bd'):attr('data-type', 'category'):attr('data-category', 'other'):attr('style', 'width:65px'):wikitext('其他')

  local year_row = table:tag('tr')
  local year_filter = year_row:tag('td')
                              :tag('div'):addClass('tabber-filter auto-first ec-btn justify-start')
  local year_first_button = year_filter:tag('div'):addClass('tabber-filter-item ec-1-bd selected'):attr('data-type', 'all'):attr('style', 'width:65px'):wikitext('全部')
  for _, item in ipairs(year) do
    year_filter:tag('div'):addClass('tabber-filter-item multi-choice ec-1-bd'):attr('data-type', 'year'):attr('data-year', item):attr('style', 'width:65px'):wikitext(item)
  end

  local fn_row = table:tag('tr')
                       :tag('td'):addClass('flex text-left justify-between')
  local image_total = fn_row:tag('span'):wikitext('符合条件的贺图数: ')
                            :tag('span'):addClass('image-count'):done()
                            :wikitext('个')
  local search_input = fn_row:tag('span'):addClass('search-tag flex'):attr('style', 'gap: 5px;')


  -- 查询参数
  local images_data, character_data = p.query_data()

  -- 生成图片
  local image_body = tabber:tag('div'):addClass('waterfall relative'):attr('data-width', args.width or ''):attr('data-rowgap', args.rowgap or ''):attr('data-colgap', args.colgap or '')
  for _, images_info in ipairs(images_data) do
    if (images_info.filename or 'string') ~= 'string' then

      -- 处理图片角色数据
      local character_list = ''
      for _, value in ipairs(images_info.character) do
        if character_list == '' then
          character_list = tostring(value)
        else
          character_list = character_list .. ',' .. tostring(value)
        end
      end

      image_body:tag('div'):attr('data-name', images_info.filename or ''):attr('data-category', images_info.category or 'other'):attr('data-year', images_info.year or 'other'):attr('data-imageWidth', images_info.image_width or ''):attr('data-imageHeight', images_info.image_height or ''):attr('data-character', character_list or ''):addClass('absolute transition-none shadow-[0px_0px_10px_0px_black] tabber-item'):attr('style', 'display: none;'):wikitext('[[File:' .. images_info.filename .. '|' .. args.width .. 'px]]'):done()
    end
  end

  -- 传递角色参数
  local params = tabber:tag('div'):addClass('character-params')
  for _, character_info in ipairs(character_data) do
    -- 合并角色俗称和搜索关键词
    if (character_info.name_chs or 'string') ~= 'string' then
      local nickname = ''
      for _, value in ipairs(character_info.search_nickname) do
        if nickname == '' then
          nickname = value
        else
          nickname = nickname .. ',' .. value
        end
      end
      for _, value in ipairs(character_info.nickname) do
        if nickname == '' then
          nickname = value
        else
          nickname = nickname .. ',' .. value
        end
      end
      params:tag('div'):addClass('params'):attr('data-name', character_info.name_chs or ''):attr('data-nickname', nickname or ''):done()
    end
  end

  return html
end

return p
