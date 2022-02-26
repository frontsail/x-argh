export default function (Alpine) {
  Alpine.directive('argh', (el, { value, modifiers, expression }, { effect, evaluateLater }) => {
    if (!value) {
      return
    }

    let { argObj, argName, deep } = resolve(el._x_dataStack, expression)
    const propObj = el._x_dataStack[0]
    const propName = camelize(value)
    const evaluator = argObj ? null : evaluateLater(expression)
    const bind = argObj && modifiers.includes('bind')

    let prevPropValue = propObj[propName]
    let prevArgValue = undefined

    effect(() => {
      deep && ({ argObj, argName, deep } = resolve(el._x_dataStack, expression))

      if (argObj) {
        // One-way binding
        if (argObj[argName] !== prevArgValue) {
          propObj[propName] = argObj[argName]
        }

        // Two-way binding
        if (bind && propObj[propName] !== prevPropValue) {
          argObj[argName] = propObj[propName]
        }

        prevArgValue = argObj[argName]
        prevPropValue = propObj[propName]
      } else {
        // The evaluator is used in case that the argument is not a property
        // of the parent component data (one-way binding).
        evaluator((argValue) => {
          if (argValue !== prevArgValue) {
            propObj[propName] = argValue
            prevArgValue = argValue
          }
        })
      }
    })
  })

  function camelize(s) {
    return s.replace(/-./g, (x) => x[1].toUpperCase())
  }

  function resolve(stack, expression) {
    let argObj = null
    let argName = null
    let deep = false

    for (let i = 1; i < stack.length; i++) {
      if (expression in stack[i]) {
        argObj = stack[i]
        argName = expression
        break
      } else if (expression.includes('.')) {
        const dotNotation = expression.split('.')
        const obj = dotNotation
          .slice(0, -1)
          .reduce((o, i) => (typeof o === 'object' ? o[i] : false), stack[i])

        if (obj) {
          const name = dotNotation.slice(-1)

          if (name in obj) {
            argObj = obj
            argName = name[0]
            deep = obj !== stack[i]
            break
          }
        }
      }
    }

    return { argObj, argName, deep }
  }
}
