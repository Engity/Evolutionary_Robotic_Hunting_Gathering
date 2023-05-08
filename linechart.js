/**
 *  Line chart used for illustration
 *  @author Toan Nguyen
 */
class Linechart {
    /**
     *
     * @param {*} game 
     * @param {*} x starting x position to draw the chart on Canvas
     * @param {*} y starting y position to draw the chart on Canvas
     * @param {*} width Width of the chart
     * @param {*} height Height of the chart
     * @param {*} data is a 1 dimensional array with each entry is a set of data. 
     * Each entry has to be a two dimensional array [][2]; 
     * Example: data = [[[6, 10],[7, 20]], [[1, 2],[2, 20]]]
     * @param {*} title title of the chart
     * @param {*} labelX Label for the x axis 
     * @param {*} labelY Label for the y axis 
     */
    constructor(game, x, y, width, height, data = [], title = "", labelX = "", labelY = "") {
        Object.assign(this, { game, x, y, width, height, title, labelX, labelY });
        this.updateCoordinate(x, y);
        this.maxValueX = -Infinity;
        this.maxValueY = -Infinity;
        this.minValueY = Infinity;
        this.minValueX = Infinity;
        this.maxDataLength = 0;
        this.data = [];
        this.addData(data);


    }

    reset() {
        this.data = [];
    }

    //Update coordinate to draw on Canvas
    updateCoordinate(x, y) {
        this.top = y + this.height;
        this.right = x + this.width;
        this.left = x;
        this.bottom = y;
    }

    //Add another data to the existing data list
    addData(newData) {
        if (!newData) {
            console.error("Empty Data, Adding Aborted.");
            return;
        }
        //Adding new data in to ensure there is always x and y values for each entry
        let dataToBeAdded = [];
        let xMax = -Infinity;
        let yMax = -Infinity;
        let xMin = Infinity;
        let yMin = Infinity;
        this.maxDataLength = Math.max(this.maxDataLength, newData.length);
  
        for (let i = 0; i < newData.length; i++) {
            if (newData[i].length < 2) {
                //Stop adding if newData is invalid
                console.error("Invalid Entry Format, Adding Aborted.");
                return;
            }
            
            dataToBeAdded.push([newData[i][0], newData[i][1]]);
            xMax = Math.max(newData[i][0], xMax);
            yMax = Math.max(newData[i][1], yMax);
            xMin = Math.min(newData[i][0], xMin);
            yMin = Math.min(newData[i][1], yMin);
        }

        this.data.push(dataToBeAdded);
        this.maxValueX = xMax;
        this.maxValueY = yMax;
        this.minValueX = xMin;
        this.minValueY = yMin;
        this.updateStat();

    }

    updateStat() {
        this.startX = this.left + 35;
        this.endX = this.right - 25;
        this.startY = this.bottom + 100;
        this.endY = this.top + 6;

        this.actualStepValueX = Math.max(this.maxDataLength / (this.maxValueX - this.minValueX), 1);
        if (!this.actualStepValueX) {
            this.actualStepValueX = 1;
        }
        //this.actualStepValueY = (this.maxValueY - this.minValueY) / (this.maxValueY - this.minValueY);
        this.coordinateStepValueX = (this.endX - this.startX) / (this.maxValueX - this.minValueX);

        if (!this.coordinateStepValueX || this.coordinateStepValueX === Infinity) {
            this.coordinateStepValueX = 1;
        }
        this.coordinateStepValueY = (this.endY - this.startY) / (this.maxValueY - this.minValueY);

        if (!this.coordinateStepValueY || this.coordinateStepValueY === Infinity) {
            this.coordinateStepValueY = 1;
        }
    }

    replaceData(index = 0, newData = []){
        if ((index < 0 || index > this.data.length)) {
            //Stop adding if newData is invalid
            console.error("Invalid Data Format, Adding Aborted.");
            return;
        }
        let oldData = this.data[index];
        this.data[index] = [];
        for (let i = 0; i < newData.length; i++){
            if (!this.addEntry(index, newData[i])){
                console.error("Invalid Data Format, Adding Aborted.");
                this.data[index] = oldData;
                return null;
            }
        }

        return true;

    }

    //Add a new single entry to existing data
    addEntry(index = 0, newEntry = []) {
        if (newEntry.length < 2 || (index < 0 || index > this.data.length)) {
            //Stop adding if newEntry is invalid
            console.error("Invalid Entry Format, Adding Aborted.");
            return null;
        }
        if (index == this.data.length) {
            this.data.push([]);
        }
        this.data[index].push(newEntry);
        this.maxValueX = Math.max(newEntry[0], this.maxValueX);
        this.maxValueY = Math.max(newEntry[1], this.maxValueY);

        this.minValueX = Math.min(newEntry[0], this.minValueX);
        this.minValueY = Math.min(newEntry[1], this.minValueY);

        this.updateStat();
        this.maxDataLength = Math.max(this.maxDataLength, this.data[index].length);

        // console.log(startX, endX);
        // console.log(startY, endY);
        // console.log("Step: ", stepValueX, stepValueY);
        // console.log("X: ",this.minValueX, this.maxValueX, this.data.length);
        // console.log("Y: ",this.minValueY, this.maxValueY, this.data.length);
        return true;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.updateCoordinate(this.x, this.y);
        this.updateStat();

    }

    update() {

    }


    drawChartText(ctx, text, x = this.x, y = this.y, fontsize = parseInt(this.width / 50), color = "orange", align = "center") {
        ctx.beginPath();
        let tmpStyle = ctx.fillStyle;
        ctx.fillStyle = color;
        ctx.font = fontsize + "px sans-serif";
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
        ctx.textAlign = "left";
        ctx.fillStyle = tmpStyle;
        ctx.fill();
        ctx.closePath();
    }

    draw(ctx) {
        ctx.clearRect(this.left, this.bottom, this.right, this.top);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.rect(this.left, this.bottom, this.right, this.top);
        ctx.stroke();
        ctx.closePath();

        let stepCoorX = (this.endX - this.startX) / Math.min(20, this.maxDataLength);
        let stepCoorY = (this.endY - this.startY) / Math.min(26, (this.maxValueY - this.minValueY));

        //Draw the label
        this.drawChartText(ctx, this.title, (this.left + this.right) / 2, this.bottom + this.startY / 4, this.height / 15);//Title
        this.drawChartText(ctx, this.labelX, (this.left + this.right) / 2, this.top + 40, this.height / 25, "black");//X asix title
        this.drawChartText(ctx, this.labelY, this.left + 10, this.bottom + this.startY / 2, this.height / 25, "black", "left");//Y axis title

        //Draw the axis
        //Y axis
        ctx.beginPath();
        ctx.strokeStyle = "black";//Light grey
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.startX, this.endY);
        //X axis
        ctx.moveTo(this.startX, this.endY);
        ctx.lineTo(this.endX, this.endY);

        ctx.stroke();
        ctx.closePath();


        //Draw reference line 
        //Set light grey color for reference lines  

        let stepValueY = Math.max((this.maxValueY - this.minValueY) / Math.min(26, (this.maxValueY - this.minValueY)), 1);
        let stepValueX = Math.max((this.maxValueX - this.minValueX) / Math.min(20, this.data.length), 1);


        ctx.strokeStyle = "green";//`hsl(297, 2%, 50%)`;//Light green

        ctx.setLineDash([1, 12]);

        let fontSizeY = 12;
        //Set the font size for x
        if (this.maxValueY >= 1000) {
            fontSizeY = 10;
            if (this.maxValueY >= 100000) {
                fontSizeY = 8;
            }
        }

        //Set up the indexes and reference line
        for (let yy = this.endY, valY = this.minValueY; yy > this.startY - 1; yy -= stepCoorY, valY += stepValueY) {
            if (yy != this.endY) {
                ctx.beginPath();
                ctx.moveTo(this.startX, yy);
                ctx.lineTo(this.endX, yy);
                ctx.stroke();
                ctx.closePath();

            }
            this.drawChartText(ctx, Math.round(valY, 1), this.left + 20, yy, fontSizeY, "black");//Draw the values

        }



        let fontSizeX = 12;
        //Set the font size for x
        if (this.maxValueX >= 1000) {
            fontSizeX = 10;
            if (this.maxValueX >= 100000) {
                fontSizeX = 8;
            }
        }
        for (let xx = this.startX, valX = this.minValueX; xx <= this.endX; xx += stepCoorX, valX += stepValueX) {
            this.drawChartText(ctx, Math.round(valX, 1), xx, this.endY + 15, fontSizeX, "black");
        }

        ctx.stroke();

        ctx.setLineDash([]);
        ctx.closePath();

        //Draw the points
        let pointColor = 200;
        let lineColor = 300;
        for (let k = 0; k < this.data.length; k++) {
            let prevX = 0;
            let prevY = 0;
            for (let i = 0; i < this.data[k].length; i++) {
                let x = (this.data[k][i][0] - this.minValueX) * this.coordinateStepValueX + this.startX;
                let y = this.endY - (this.data[k][i][1] - this.minValueY) * this.coordinateStepValueY;//+ this.startY;

                //connect the points to create a line
                if (i !== 0) {
                    ctx.beginPath();
                    ctx.strokeStyle = `hsl(${lineColor}, 100%, 50%)`;
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    //ctx.fill();
                    ctx.closePath();
                }


                //Draw the points
                if (parseInt(i % this.actualStepValueX) == 0 || i == 0) {
                    ctx.beginPath();
                    ctx.fillStyle = `hsl(${pointColor}, 100%, 50%)`;
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    //ctx.stroke();
                    ctx.fill();
                    ctx.closePath();
                }

                prevX = x;
                prevY = y;


            }
            lineColor += 100;
            lineColor %= 361;
            pointColor += 50;
            pointColor %= 361;
        }

        ctx.closePath();
        ctx.strokeStyle = "black";
    }

    updateMax() {
        this.data.forEach(data => {
            for (let i = 0; i < data.length; i++){
                this.maxValX = Math.max(...data[i][0]);
                this.maxValY = Math.max(...data[i][1]);
            }
        });
        
    }
}

