export default function (Alpine) {
  // The directive
  Alpine.directive('argh', (el, { value, modifiers, expression }, { effect, evaluate }) => {
    // Value is
    // required
    if (!value) {
      return
    }

    // @todo need better var names, comments, and documentation

    let { argObj, argName, deep } = resolve(el._x_dataStack, expression)
    const propObj = el._x_dataStack[0]
    const propName = camelize(value)
    const bind = argObj && modifiers.includes('bind')

    let prevPropValue = propObj[propName]
    let prevArgObj = argObj
    let prevArgValue = undefined

    effect(() => {
      prevArgObj = argObj
      deep && ({ argObj, argName, deep } = resolve(el._x_dataStack, expression))

      if (argObj) {
        // One-way binding
        if (argObj[argName] !== prevArgValue || argObj !== prevArgObj) {
          propObj[propName] = argObj[argName]
        }

        // Two-way binding
        if (bind && propObj[propName] !== prevPropValue) {
          argObj[argName] = propObj[propName]
        }

        prevArgValue = argObj[argName]
        prevPropValue = propObj[propName]
      } else {
        // The evaluator is used in
        // case that the argument is
        // not a property of the parent
        // component's data (one-way binding).
        const argValue = evaluate(expression)

        if (argValue !== prevArgValue) {
          propObj[propName] = argValue
          prevArgValue = argValue
        }
      }
    })
  })

  /**
   * Transforms an example-string into an exampleString.
   *
   * @param {string} s String to camelize
   * @returns {string} The camelized string
   */
  function camelize(s) {
    return s.replace(/-./g, (x) => x[1].toUpperCase())
  }

  /**
   * Find the closest property from an expression by searching Alpine data
   * stacks of the parent components.
   *
   * @param {object} stack Alpine data stack
   * @param {string} expression The directive attribute value
   * @returns {object} Resolved argument parameters
   */
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
          argObj = obj
          argName = dotNotation[dotNotation.length - 1]
          deep = obj !== stack[i]
          break
        }
      }
    }

    return { argObj, argName, deep }
  }
}
