# Helper Functions
sum = (arr) -> arr.reduce (t, s) -> t + s
# sorts
numericSort = (a, b) -> a - b
randomSort = (a, b) -> Math.random() > 0.5
# 2147483647.5 is half the colorspace in decimal
orSort = (a, b) -> 2147483647.5 - (a | b)
xorSort = (a, b) -> 2147483647.5 - (a ^ b)
andSort = (a, b) -> 2147483647.5 - (a & b)
# change endianess
swapEnd32 = (val) -> (((val & 0xFF) << 24) | ((val & 0xFF00) << 8) |
                  ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF)) >>> 8

randminmax = (min, max) ->
  # generate min & max values by picking
  # one 'fairly', then picking another from the remainder
  randA = Math.floor(max * Math.random())
  randB = Math.floor(randA * Math.random())
  return [randB, randA]

slice_range = (width, height, multiplier = 4) ->
  opt = (Math.random() * 1001) % 4
  x = 0
  y = 0
  px = (width * height * multiplier)
  ratio = (Math.random() > 0.5) ? 1.7 : 1.61803
  # cheap approximation of phi, or actual phi
  if (opt == 1)
    x = Math.floor((Math.random() * px))
    y = Math.floor(x / ratio)
  else if (opt == 2)
    x = if Math.random() < 0.5 then Math.floor(Math.random() * px) else px
    y = Math.floor(x / ratio)
  else if (opt == 3)
    x = Math.floor(Math.random() * px)
    y = x - Math.floor((Math.random() * 5101) + 1000)
  else
    mm = randminmax(0, px)
    x = mm[0]
    y = mm[1]

  tmp = x - y
  return [x, y]

# Image manipulations
Caman.Filter.register 'color884', ->
  @process 'color884', (rgba) ->
    rgba.b = rgba.b >> 4

Caman.Filter.register 'randomColorShift', ->
  r = Caman.Calculate.randomRange(-50,50)
  g = Caman.Calculate.randomRange(-50,50)
  b = Caman.Calculate.randomRange(-50,50)
  @channels red: r, blue: b, green: g


Caman.Filter.register 'randomRedShift', ->
  @channels red: Caman.Calculate.randomRange(-50,50)


Caman.Filter.register 'randomBlueShift', ->
  @channels blue: Caman.Calculate.randomRange(-50,50)


Caman.Filter.register 'randomGreenShift', ->
  @channels green: Caman.Calculate.randomRange(-50,50)


Caman.Filter.register 'superRandomShift', ->
  rand = (Math.round(Math.random * 10) + 1)
  while rand -= 1
    @randomColorShift


Caman.Filter.register 'colorShift', ->
  @process 'colorShift', (rgba) ->
    rgba.r = if rgba.r > Math.random() * 255 then  rgba.g else  rgba.b
    rgba.g = if rgba.g > Math.random() * 255 then  rgba.r else  rgba.b
    rgba.b = if rgba.b > Math.random() * 255 then  rgba.g else  rgba.r


Caman.Filter.register 'redShift', ->
  factor = Math.floor((Math.random() * 128) / 2)
  @process 'redShift', (rgba) ->
    rgba.r += factor % 255
    rgba.g -= factor
    rgba.b -= factor


Caman.Filter.register 'greenShift', ->
  factor = Math.floor((Math.random() * 128) / 2)
  @process 'greenShift', (rgba) ->
    rgba.r -= factor
    rgba.g += factor % 255
    rgba.b -= factor


Caman.Filter.register 'blueShift', ->
  factor = Math.floor((Math.random() * 128) / 2)
  @process 'blueShift', (rgba) ->
    rgba.r -= factor
    rgba.g -= factor
    rgba.b += factor % 255


Caman.Filter.register 'superShift', ->
  rand = (Math.round(Math.random * 10) + 1)
  while rand -= 1
    @colorShift


Caman.Filter.register 'pixelate', (pixelation = 5) ->
  width = @dimensions.width
  height = @dimensions.height
  data = @pixelData
  for y in [0..height] by pixelation
    for x in [0..width] by pixelation
      i = 4 * (y * width + x)
      for n in [0..pixelation]
        for m in [0..pixelation]
          if (x + m < width)
            j = ((width * (y + n)) + (x + m)) * 4
            data[j] = data[i]
            data[j + 1] = data[i + 1]
            data[j + 2] = data[i + 2]
  @


Caman.Filter.register 'fractalGhosts', ->
  data = @pixelData
  for i in data
    if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10))
      data[i] = data[i * 2 % data.length]
  @


Caman.Filter.register 'fractalGhosts2', ->
  data = @pixelData
  rand = 1 + Math.floor(Math.random() * 11)
  for i in data
    if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10))
      tmp = (i * rand) % data.length
      if (parseInt(data[tmp], 10) < parseInt(data[i], 10))
        data[i] = data[tmp]
  @


Caman.Filter.register 'fractalGhosts3', ->
  data = @pixelData
  rand = 1 + Math.floor(Math.random() * 11)
  for i in data
    if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10))
      if i % 4 == 0 then continue
      tmp = (i * rand) % data.length
      if (parseInt(data[tmp], 10) < parseInt(data[i], 10))
        data[i] = data[tmp]
  @


Caman.Filter.register 'slice', ->
  width = @dimensions.width
  height = @dimensions.height
  data = @pixelData
  cutend = Math.floor((Math.random() * (width * height * 4)))
  cutstart = Math.floor(cutend / 1.7)
  cut = data.subarray(cutstart, cutend)
  data.set(cut, Math.floor(Math.random() *
                          ((width * height * 4) - cut.length)))
  @


Caman.Filter.register 'ditherRandom', ->
  @process 'ditherRandom', (rgba) ->
    gray = (rgba.r + rgba.g + rgba.b / 3) % 255
    val = if gray < Math.round(Math.random() * 128) then 0 else 0xff
    rgba.r = rgba.g = rgba.b = val


Caman.Filter.register 'ditherRandomColor', ->
  @process 'ditherRandomColor', (rgba) ->
    rgba.r = if rgba.r < Math.round(Math.random() * 128) then 0 else 0xff
    rgba.g = if rgba.g < Math.round(Math.random() * 128) then 0 else 0xff
    rgba.b = if rgba.b < Math.round(Math.random() * 128) then 0 else 0xff


Caman.Filter.register 'ditherBitshift',
      (mask = Math.floor(Math.random() * 3)) ->
  mask = (mask % 3)
  masks = [ 0xc0, 0xe0, 0xf0 ] # var mask order = 3, 1, 2
  @process 'ditherBitshift', (rgba) ->
    rgba.r &= masks[mask]
    rgba.g &= masks[mask]
    rgba.b &= masks[mask]


Caman.Filter.register 'dither8bit', (size = 4) ->
  width = @dimensions.width
  height = @dimensions.height
  data = @pixelData
  ind = (a,b,c,d) => 4 * (width * (a + b)) + c + d
  for y in [0..height]
    for x in [0..width]
      sum_r = 0
      sum_g = 0
      sum_b = 0
      for s_y in [0..size]
        for s_x in [0..size]
          sum_r += data[ind(y,s_y,x,s_x)]
          sum_g += data[ind(y,s_y,x,s_x) + 1]
          sum_b += data[ind(y,s_y,x,s_x) + 2]
      avg_r = if sum_r / (size * size) > 127 then 0xff else 0
      avg_g = if sum_g / (size * size) > 127 then 0xff else 0
      avg_b = if sum_b / (size * size) > 127 then 0xff else 0
      for r_y in [0..size]
        for r_x in [0..size]
          data[ind(y,r_y,x,r_x)] = avg_r
          data[ind(y,r_y,x,r_x) + 1] = avg_g
          data[ind(y,r_y,x,r_x) + 2] = avg_b
  @

Caman.Filter.register 'shortNumericSort', () ->
  data = new Uint32Array(@pixelData)
  mm = slice_range(@width, @height, 1)
  da = Array.apply([], data.subarray(mm[0], mm[1]))
  da.sort(numericSort)
  @pixelData.data.set(da, mm[0])

Caman.Filter.register 'shortDumbSort', () ->
  data = new Uint32Array(@pixelData)
  mm = slice_range(@width, @height, 1)
  da = Array.apply([], data.subarray(mm[0], mm[1]))
  da.sort()
  @pixelData.data.set(da, mm[0])

Caman.Filter.register 'AnyShortSort', () ->
  opt = Math.round(Math.random())
  if opt == 1
    @shortDumbSort()
  else 
    @shortNumericSort()

Caman.Filter.register 'sort', () ->
  data = new Uint32Array(@pixelData)
  mm = randminmax(0, data.length)
  da = Array.apply([], data.subarray(mm[0], mm[1]))
  da.sort(numericSort)
  @pixelData.data.set(da, mm[0])


Caman.Filter.register 'bettersort', () ->
  data = new Uint32Array(@pixelData)
  mm = randminmax(0, data.length)
  cut = data.subarray(mm[0], mm[1])
  Array.prototype.sort.call(cut, numericSort)
  @pixelData.data.set(data.buffer)


Caman.Filter.register 'AnySort', () ->
  opt = Math.round(Math.random())
  if (opt == 1)
    @bettersort()
  else
    @sort()
