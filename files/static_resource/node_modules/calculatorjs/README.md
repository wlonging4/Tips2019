# Calculatorjs

[![NPM version](https://img.shields.io/npm/v/calculatorjs.svg?style=flat)](https://www.npmjs.com/package/calculatorjs)

[中文文档](/README-ZH.md)

```javascript
> 2.1 + 2.2
4.300000000000001
> calc(' 2.1 + 2.2 ')
4.3
```

## Usage
Using NPM:
```bash
npm install --save calculatorjs
```
In Node.js or Browser:
```javascript
const calc = require('calculatorjs')

console.log(calc(' 0.1*(0.1+0.1) '))
```
Direct `<script>` Include
```html
<script src="calc.js"></script>
<script>
    console.log(calc(' 0.1 * (0.1 + 0.1) '))
</script>
```

## DOC
### Arithmetic expression
```javascript
calc(' 1 + (2 * 3 - 1) / 4 * -1 ')
```
Support **+** **-** **\*** **/** **(** **)** **minus**

### API
```javascript
calc.add(0.1, 0.2) // 0.3
calc.sub(0.1, 0.2) // -0.1
calc.mul(0.1, 0.2) // 0.02
calc.div(0.1, 0.2) // 0.5
calc.round(0.555, 2) // 0.56
```

## License

Distributed under [MIT License](http://opensource.org/licenses/MIT).
