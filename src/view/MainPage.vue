<template>

  <div id="secondSection" style="float: left">

    <div id="calculator" style="width: 25vw; height: 30vh; margin: auto;" @click="getCoorOfClick($event)"></div>

    <div style="float: right">
      <div id="table-container">
        <table id="resultTable" cellpadding="7" cellspacing="0" class="table">
          <caption style="font: small-caps bold 40px sans-serif;">Result table</caption>
          <thead style="font-size: 1.2vw">
          <tr id="heads">
            <th v-for="headerValue in tableHeader" :key="headerValue">
               {{ headerValue }}
            </th>
          </tr>
          </thead>
          <tbody style="font-size: 1.2vw">
            <tr v-for="point in points" :key="point">
              <td v-for="param in point" :key="param">
                {{ param }}
              </td>
            </tr>
          </tbody> 
        </table>
      </div>
    </div>

  </div>
 

  <div id="footer">
        <div id="X_place">
            <fieldset>
                <legend>Choose coordinate X:</legend>
                <input 
                    type="range" 
                    min="-3" 
                    max="5" 
                    step="0.01"
                    v-model="xValue"
                />
                <div class="numbers">
                   {{xValue}} 
                </div>
            </fieldset>
        </div>

        <div id="Y_place">
            <fieldset>
                <legend>Choose coordinate Y:</legend>
                <input 
                    type="range" 
                    min="-3" 
                    max="5" 
                    step="0.01"
                    v-model="yValue"
                />
                <div class="numbers">
                   {{yValue}} 
                </div>
            </fieldset>
        </div>

        <div id="R_place">
            <fieldset>
                <legend>Choose coordinate R:</legend>
                <input 
                    id="rValue"
                    type="range" 
                    min="-3" 
                    max="5" 
                    step="0.1"
                    v-model="rValue"
                    @change="drawGraph(rValue)"
                />
                <div class="numbers">
                   {{rValue}} 
                </div>
            </fieldset>
        </div>

        <form id="checkButton">
          <custom-button @click.prevent="addDotsRequest" id="checking">Confirm</custom-button>
        </form>

        <form id="clearButton">
          <custom-button id="clearing" @click.prevent="deleteDotsRequest()">Clear</custom-button>
        </form>

        <custom-button id="logoutButton" @click="logoutRequest">LogOut</custom-button>
    </div>
</template>

<script>
import Desmos from "desmos"
import CustomButton from "@/components/CustomButton.vue";

export default {
  components: {CustomButton},
  data() {
    return {
      tableHeader: ["X", "Y", "Radius", "Current Time", "Executing Time", "Result"],
      yValue: 1,
      xValue: 1,
      rValue: 1,
      calculator: null,
      isValid: true,
      points: []
    };
  },
  async mounted() {
    var elt = document.getElementById('calculator');
    console.log(elt);
    let options = {
        keypad: false, settingsMenu: false, expressions:false, zoomButtons: false, expressionsTopbar: false, lockViewport: true,
        xAxisStep: 1, xAxisLabel: "X", yAxisLabel: "Y"
    };
    if(this.rValue != 0) {
    if(this.calculator != null){
        destroyGrafic();
    }
    this.calculator = Desmos.GraphingCalculator(elt, options);
    this.calculator.setExpression({id: "line1", latex: `y<=x/2+(${this.rValue}/2)\\left\\{0<=y<=(${this.rValue})\\right\\}\\left\\{-3<=x<=0\\right\\}`, color: Desmos.Colors.BLUE});
    this.calculator.setExpression({id: "line2", latex: `x<=(${this.rValue}/2)\\left\\{0<=y<=${this.rValue}\\right\\}\\left\\{0<=x\\right\\}`, color: Desmos.Colors.BLUE});
    this.calculator.setExpression({id: "line3", latex: `y<=${this.rValue}\\left\\{y>=0\\right\\}\\left\\{0<=x<=(${this.rValue}/2)\\right\\}`, color: Desmos.Colors.BLUE});
    this.calculator.setExpression({id: "line4", latex: `x^2+y^2<=(${this.rValue})^2\\left\\{-5<=y<=0\\right\\}\\left\\{-5<=x<=0\\right\\}`, color: Desmos.Colors.BLUE});
    }else{
        this.calculator = Desmos.GraphingCalculator(elt, options);
    }
    await this.getPoints();

    function destroyGrafic(){
        this.calculator.destroy();
    }
  },
  methods: {
    setX(value) {
      this.xValue = value;
    },
    setR(value) {
      this.rValue = value;
    },
    async getPoints() {
      const url = "http://localhost:8080/web_4_spring/api/dots/getDots"
      const method = 'get'
      console.log(url);
      const userResult = await this.$store.dispatch('auth/requestWithoutParams', {url, method})
      if (userResult !== null) {
        switch (userResult.status) {
          case 401:
            this.notAuthResponseHandler('Not authorized. Dots can not be loaded');
            return false;
          case 200:
            const resultArray = await userResult.json()
            this.points = resultArray.map(result => ({
              x: result.x,
              y: result.y,
              r: result.r,
              curRequestTime: result.curRequestTime,
              executionTime: result.executionTime,
              hitType: result.hitType
            }));
            this.drawDots();
            return true;
        }
      } else {
        alert('Server is down');
      }
    },
    async addDotsRequest() {
      let fixedX = parseFloat(this.xValue.toFixed(13))
      let fixedY = parseFloat(this.yValue.toFixed(13))
      let fixedR = parseFloat(Number(this.rValue).toFixed(13))
      const data = {x: fixedX, y: fixedY, r: fixedR}
      console.log(data);
      const url = "http://localhost:8080/web_4_spring/api/dots/add"
      const response = await this.$store.dispatch('auth/userMainPageRequest', {data, url})
      if (response === null) {
        alert('Server is down');
        return;
      }
      switch (response.status) {
        case 401:
          this.notAuthResponseHandler('Not authorized. Dots can not be loaded');
          return false;
        case 400:
          const parsedResponse = await response.json();
          alert(parsedResponse.detailMessage);
          return false;
        case 200:
          const result = await response.json();
          this.points.push({
            x: result.x,
            y: result.y,
            r: result.r,
            curRequestTime: result.curRequestTime,
            executionTime: result.executionTime,
            hitType: result.hitType });
            this.drawDot();
      }
    },
    async deleteDotsRequest() {
      const url = "http://localhost:8080/web_4_spring/api/dots/deleteDots";
      const method = 'delete'
      const response = await this.$store.dispatch('auth/requestWithoutParams', {url, method})
      let r = this.rValue
      if (response !== null) {
        switch (response.status) {
          case 200:
            await this.getPoints();
            this.drawGraph();
            this.rValue = r;
            break;
          case 400:
            const jsonResponse = await response.json();
            alert(jsonResponse.detailMessage);
            break;
          case 401:
            this.notAuthResponseHandler("Not authorised. Returning to login page");
            break;
        }
      } else {
        alert('Server is down')
      }
    },
    notAuthResponseHandler(message) {
      alert(message);
      setTimeout(() => {
        this.$router.push("/auth");
      }, 1000)
    },
    async logoutRequest() {
      const url = "http://localhost:8080/web_4_spring/api/auth/logout"
      const data = "";
      const logoutResponse = await this.$store.dispatch('auth/userMainPageRequest', {data, url})
      if (logoutResponse !== null) {
        switch (logoutResponse.status) {
          case 200:
            const parsedLogoutResponse = await logoutResponse.json();
            this.notAuthResponseHandler(parsedLogoutResponse.message);
            localStorage.removeItem("exp_date")
            break;
        }
      }
    },
    async getCoorOfClick(event){
      if(this.rValue >= 0){
        let graf = document.getElementById("calculator");
        let rect = graf.getBoundingClientRect();
        let X = event.clientX - rect.left;
        let Y = event.clientY - rect.top;
        console.log(X, Y, this.rValue);
        // Note, pixelsToMath expects x and y to be referenced to the top left of
        // the calculator's parent container.
        let mathCoordinates = this.calculator.pixelsToMath({x: X, y: Y});
        console.log(mathCoordinates.x, mathCoordinates.y)
        this.xValue = mathCoordinates.x;
        this.yValue = mathCoordinates.y;
        console.log(this.xValue, this.yValue)
        await this.addDotsRequest();
      }
    },
    drawDot(){
      let color;
      let x = this.xValue
      let y = this.yValue
      let r = this.rValue
      if (y <= x/2 + r/2 && 0 <= y && y <= r && -3 <= x && x <= 0 && 0 <= r) {
        color = Desmos.Colors.GREEN; 
      } else if (x*x + y*y <= r*r && -5 <= x && x <= 0 && -5 <= y && y <= 0 && 0 <= r) {
        color = Desmos.Colors.GREEN; 
      } else if (0 <= x && x <= r/2 && 0 <= y && y <= r && 0 <= r) {
        color = Desmos.Colors.GREEN; 
      } else {
        color = Desmos.Colors.RED;
      }
      this.calculator.setExpression({
        id: x + '' + y,
        color: color,
        latex: `\\left(${x},${y}\\right)`
      });
    },
    drawDots(){
      for(var point in this.points){
        console.log(this.points[point].x, this.points[point].y, this.points[point].r)
        this.xValue = this.points[point].x;
        this.yValue = this.points[point].y;
        if(this.points[point].hitType == "Not valid data received"){
          continue
        }
        this.drawDot();
      }
    },
    drawGraph(rValue){
      var elt = document.getElementById('calculator');
      let options = {
        keypad: false, settingsMenu: false, expressions:false, zoomButtons: false, expressionsTopbar: false, lockViewport: true,
        xAxisStep: 1, xAxisLabel: "X", yAxisLabel: "Y"
      };
      if(this.calculator != null){
        this.calculator.destroy();
      }
      if(this.rValue >= 0) {
        this.calculator = Desmos.GraphingCalculator(elt, options);
        this.calculator.setExpression({id: "line1", latex: `y<=x/2+(${this.rValue}/2)\\left\\{0<=y<=(${this.rValue})\\right\\}\\left\\{x<=0\\right\\}`, color: Desmos.Colors.BLUE});
        this.calculator.setExpression({id: "line2", latex: `x<=(${this.rValue}/2)\\left\\{0<=y<=${this.rValue}\\right\\}\\left\\{0<=x\\right\\}`, color: Desmos.Colors.BLUE});
        this.calculator.setExpression({id: "line3", latex: `y<=${this.rValue}\\left\\{y>=0\\right\\}\\left\\{0<=x<=(${this.rValue}/2)\\right\\}`, color: Desmos.Colors.BLUE});
        this.calculator.setExpression({id: "line4", latex: `x^2+y^2<=(${this.rValue})^2\\left\\{-5<=y<=0\\right\\}\\left\\{-5<=x<=0\\right\\}`, color: Desmos.Colors.BLUE});
      }else{
          this.calculator = Desmos.GraphingCalculator(elt, options);
      }
      this.drawDots();
    },
  }
}
</script>

<style scoped>
.image {
  margin-top: 20px;
  margin-left: 35px;
}

.coordinates {
  background-color: #595f72;
  margin-top: 20px;
  margin-left: 35px;
  width: 470px;
  padding: 15px;
  color: white;
  border-radius: 15px;
}

.input {
  height: 20px;
  width: 200px;
}

#checkButton {
  display: flex;
  justify-content: center;
  grid-area: d;
}

#clearButton {
  display: flex;
  justify-content: center;
  grid-area: e;
}

#logoutButton {
  grid-area: f;
}

#checking,
#clearing,
#logoutButton {
  margin: auto;
  width: 170px;
  height: 40px;
  margin-top: 10px;
  font-size: 17px;
  border-radius: 15px;
}

.table {
  border-collapse: collapse;
  margin-right: 35px;
  margin-left: 35px;
}

.table th,
.table td {
  color: black;
  border: 2px solid black;
  text-align: center;
  width: auto;
}

#table-container {
  max-height: 395px; 
  overflow-y: auto;  
}

#footer{
        font: small-caps bold 1vw/1 sans-serif;
        border-radius: 20px;
        margin-top: 20px;
        background-color: antiquewhite;
        border: 1px solid #333;
        height: 250px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas: 
        "a b c"
        "d e f";
    }

    input[type="range"]{
        width: 40%;
        accent-color: rgb(53, 180, 180);
        margin: auto;
    }

    fieldset{
        margin-top: 20px;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .numbers{
      margin: 10px auto;
      font-size: 1.2vw;
    }

    legend{
      margin: auto;
      font-size: 1.2vw;
    }

    #secondSection{
        border-radius: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 20px;
        margin-bottom: 20px;
        background-color: antiquewhite;
        border: 1px solid #333;
        height: 500px;
        width: 100%;
        justify-items: center;
    }

</style>