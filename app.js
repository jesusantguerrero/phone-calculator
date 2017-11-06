const b = '789456123.0=,DEL,/,x,-,+,CL';
const buttons    = b.slice(0,12).split('')
const operators  = b.slice(13).split(',') 
const changers = ['=','DEL','CL']

const phoneCalculator = new Vue({
  el: '#phone-calculator',
  data: {
    buttons,
    operators,
    current: [0],
    history: [],
    mode: {
      initial: true,
      deleted: false,
      result: false,
      error: false
    },
    last: '',
    time: '',
    splash: true
  },
  mounted(){
    setInterval(this.getTime,1000)
    this.quitSplash()
  },
  
  filters: {
   toString(val) {
     return val.join('')
   }
 },

  methods: {
    // functions for controls

    clickHandler(val){
     (!changers.includes(val)) ? this.write(val) : this.resolveAction(val)
    },
    
    write(val){
      const len = this.current.length
      if (operators.includes(val)){
        if (!this.mode.initial && !operators.includes(this.last)) {
          this.current = [val]
          this.history.push(val)
          this.setMode('operator',true)
        }
      } else if (this.mode.initial && val != '.' || len > 10 ) {
        this.current = [val]
        this.history = [val]
        this.setMode('initial',false)
      } else {
        if (operators.includes(this.last) || this.mode.deleted){
         this.current = []
         this.setMode('deleted', false)
        }
        this.current.push(val) 
        this.history.push(val)
        this.setMode('initial',false)
      }
      this.mode.result = false
      this.last = val
    },
    
    resolveAction(val) {
      (val == '=') ? this.answer() : this[val]()
    },
    
    CL() {
      this.current = [0]
      this.history = []
      this.mode.initial = true
    },
    
    DEL() {
      const len = this.history.length
      this.history.pop()
      if (this.history.length) {
       this.current = [this.history[len - 2]]
       this.last = this.current[0]
       this.setMode('deleted', true)
      } else {
       this.CL()
      }
    },
  
    // Calculate related Functions
    answer(){
      const self = this
      let result = this.orderExpression()
      let lastLength = result.length

      while (result.length > 1) {
        for (let i = 0 ; i < result.length; i++) {
          const operator = result[i] 
          const left = result[i - 1]
          const right = result[ i + 1]
          const haveHighOrder =  result.includes('x') || result.includes('/');
          const highOrder =  'x/'.includes(operator)
          const lowOrder =  '+-'.includes(operator)

          if (highOrder) {
            const value = self.doOperation(left, operator, right)
            result.splice(i - 1, 3, value)
            break;
          } else if (!haveHighOrder && lowOrder){
            const value = self.doOperation(left, operator, right)
            result.splice(i - 1, 3, value)
            break;
          }
        }

        if (lastLength == result.length) {
          this.mode.error = true
          break
        }
      }
      (this.mode.error) ? this.showError() : this.showResult(result)
    },
    
    orderExpression(){
      let history = this.history
      const operations = []
      
      history = history.map((n) => {
        if (operators.includes(n)){
          operations.push(n)
          return '|'
        }
        return n
      })

      const numbers = history.join('').split('|')
      history = [];

      numbers.forEach((n, i) => {
        history.push(n)
        if (operations[i])
          history.push(operations[i])
      })

      return history
    },
    
    showResult(val){
      const self = this
      this.current = [val]  
      this.history = [val]
      this.mode.result = true
      this.last = val
      setTimeout(()=> {
        self.mode.result = false
      }, 2000)
    },

    showError(){
      const self = this
      this.current = ['Error']  
      this.history = []
      this.mode.error = true
      this.last = ''
      setTimeout(()=> {
        self.mode.error = false
        self.current = [0]
      }, 2000)
    },
    
    doOperation(left, operator, right) {
       switch(operator){
         case '/':
            const result = parseFloat(left) / parseFloat(right)
            return resizeBy.toFixed(2)
            break;
         case 'x':
            return parseFloat(left) * parseFloat(right)
            break;
          case '-':
            return parseFloat(left) - parseFloat(right)
            break;
          case '+':
           return parseFloat(left)  + parseFloat(right)
        }
    },

   //  decoration styles and behavior ralated

    setMode(name, value){
      this.mode[name] = value
    },

    getTime() {
      const date = new Date()
      let time = date.toLocaleTimeString().slice(0,5)
      if (time[4] == ':') {
        time = '0' + time.slice(0,4)
      }
      this.time  = time
    },

    quitSplash() {
      const self = this
      setTimeout(()=> {
        self.splash = false
      }, 1000)
    }
  }
})
