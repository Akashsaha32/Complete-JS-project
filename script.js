var BudgetController = (function(){
	let Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value/totalIncome)*100);
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};


	let Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	}

	function calculateTotal(type){
		let sum = 0;
		data.allItems[type].forEach(function(curr){
			sum += curr.value;
		});
		data.totals[type] = sum;

		//console.log(sum);
	}

	let data = {
		allItems : {
			exp : [],
			inc : []
		},
		totals : {
			exp : 0,
			inc : 0
		},
		budget : 0,
		percentage : -1
	};

	return {
		addItem : function(type, des, val){
			let newItem, ID;

			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}else{
				ID = 0;
			}

			if(type === 'exp'){
				newItem = new Expense(ID, des, val);
			}
			else if(type === 'inc'){
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);
			//console.log(data.allItems[type]);
			return newItem;
		},

		calculateBudget : function(){
			calculateTotal('inc');
			calculateTotal('exp');

			data.budget = data.totals.inc - data.totals.exp;
			//console.log(data.budget);

			if(data.totals.inc>0){
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}
		},
		getBudget : function(){
			return{
				budget : data.budget,
				percentage : data.percentage,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp
			};
		},
		calculatePercent : function(){
			data.allItems.exp.forEach(function(curr){
				curr.calPercentage(data.totals.inc);
			});
		},

		getPercent : function(){
			let allpercent = data.allItems.exp.map(function(curr){
				return curr.percentage;
			});
			return allpercent;
		},

		deleteItem : function(type, Id){
			let ids, index;
			ids = data.allItems[type].map(function(curr){
				return curr.id;
			});
			index = ids.indexOf(Id);
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}

		}
	};
})();


var UiController = (function(){

	let DOMString = {
		currTime : '.currentDate',
		budgetTime : '.budget__title--month',
		inputType : '.add__type',
		inputDescription : '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incController : '.income__list',
		expController : '.expenses__list',
		budgetVal : '.budget__value',
		budgetInc : '.budget__income--value',
		budgetExp : '.budget__expenses--value',
		budgetPer : '.budget__expenses--percentage',
		expPercent : '.item__percentage',
		delete : '.container'
	};

	function twoDigit(x){
		let makeTwoDigit;
		x < 10 ? makeTwoDigit = '0'+x.toString() : makeTwoDigit = x.toString();
		return makeTwoDigit;
	}

	function dateTime(){
		let month, year, day, hour, min, sec, date, time;
		const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", 
			"September", "October", "November", "December"];

		let CurrDate = new Date();
		year = CurrDate.getFullYear();
		m = CurrDate.getMonth();
		month = monthName[m];
		day = CurrDate.getDate();
		min = twoDigit(CurrDate.getMinutes());
		sec = twoDigit(CurrDate.getSeconds());

		let h = CurrDate.getHours();
		let hh;
		h == 0 ? hh = 12 : hh = h;
		hh > 12 ? hour = hh - 12 : hour = hh;

		hour = twoDigit(hour);

		date = month + ', '+year.toString();
		time = month+'-'+day+'-'+year+' || '+hour+' : '+min+' : '+sec;

		return {
			fullDate : date,
			fullTime : time
		};
	}

	function numberFormat(num, type){

		let int, dec, format, sign;

		num = Math.abs(num);
		num = num.toFixed(2);
		num = num.split('.');

		int = num[0];
		dec = num[1];
		//+23,000.00
		if(int.length > 3){
			int = int.substr(0, int.length-3) +','+int.substr(int.length-3, int.length);
		}
		type === 'exp' ? sign = '-' : sign = '+';

		format = sign+' '+int+'.'+dec;
		return format;
	}

	return{
		getDateTime : function(){
			let input = dateTime();
			document.querySelector(DOMString.currTime).textContent = input.fullTime;
			document.querySelector(DOMString.budgetTime).textContent = input.fullDate;
		},

		getInput : function(){
			return{
				type : document.querySelector(DOMString.inputType).value,
				description : document.querySelector(DOMString.inputDescription).value,
				value : parseFloat(document.querySelector(DOMString.inputValue).value)
			};
		},

		addItemList : function(obj, type){
			let html, newHtml, element;

			if(type === 'inc'){
				element = DOMString.incController;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else if(type === 'exp'){
				element = DOMString.expController;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', numberFormat(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		clearField : function(){
			let field, fieldsArr;

			field = document.querySelectorAll(DOMString.inputDescription + ','+ DOMString.inputValue);
			fieldsArr = Array.prototype.slice.call(field);
			fieldsArr.forEach(function(curr, index, arr){
				//console.log(curr, index, arr);
				curr.value = "";
			});
			fieldsArr[0].focus();
		},

		changeType : function(){
			let field, arrField;
			field = document.querySelectorAll(DOMString.inputType+','+DOMString.inputDescription+','+DOMString.inputValue);
			arrField = Array.prototype.slice.call(field);
			arrField.forEach(function(curr){
				curr.classList.toggle('red-focus');
			});
			document.querySelector(DOMString.inputBtn).classList.toggle('red');
		},

		displayBudget : function(obj){
			let type;
			obj.budget >= 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMString.budgetVal).textContent = numberFormat(obj.budget, type);
			document.querySelector(DOMString.budgetInc).textContent = numberFormat(obj.totalInc, 'inc');
			document.querySelector(DOMString.budgetExp).textContent = numberFormat(obj.totalExp, 'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMString.budgetPer).textContent = obj.percentage+'%';
			}else{
				document.querySelector(DOMString.budgetPer).textContent = '---';
			}
		},

		displayPercent : function(arrPercent){
			let field;
			field = document.querySelectorAll(DOMString.expPercent);
			for(let i=0; i<arrPercent.length; i++){
				if(arrPercent[i] > 0){
					field[i].textContent = arrPercent[i]+'%';
				}else{
					field[i].textContent = '---';
				}
			}
		},

		deleteListItem : function(itemid){
			let element;
			element = document.querySelector('#'+itemid);
			element.parentNode.removeChild(element);
		},

		getDomString : function(){
			return DOMString;
		}
	};
})();

var Controller = (function(bzCntl, uiCntl){
	uiCntl.getDateTime();
	setInterval(uiCntl.getDateTime, 950);

	function setupUiController(){
		var DOM = uiCntl.getDomString();
		document.querySelector(DOM.inputBtn).addEventListener('click', cntlAddItem);

		document.addEventListener('keypress', function(event){
			if(event.keyCode == 13 || event.which == 13){
				cntlAddItem();
			}
		});

		document.querySelector(DOM.inputType).addEventListener('change', uiCntl.changeType);

		document.querySelector(DOM.delete).addEventListener('click', cntlDeleteItem);
	}

	function updateBudget(){
		bzCntl.calculateBudget();
		let budgetInfo = bzCntl.getBudget();
		//console.log(budgetInfo);

		uiCntl.displayBudget(budgetInfo);
	}

	function updatePercentage(){
		bzCntl.calculatePercent();
		let allpercent = bzCntl.getPercent();
		uiCntl.displayPercent(allpercent);
	}

	function cntlAddItem(){
		let input, newItem;
		input = uiCntl.getInput();
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			newItem = bzCntl.addItem(input.type, input.description, input.value);
			//console.log(newItem);
			// add income list in ui
			uiCntl.addItemList(newItem, input.type);
			// clear all field
			uiCntl.clearField();

			updateBudget();

			updatePercentage();
			
		}
	}

	let cntlDeleteItem = function(event){
		let itemId;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemId){
			//inc-0
			let splitId, type, id;

			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			bzCntl.deleteItem(type, id);

			uiCntl.deleteListItem(itemId);
			//update budget
			updateBudget();
			//recalculate percentage
			updatePercentage();




		}
	};

	return{
		init : function(){
			uiCntl.displayBudget({
				budget : 0,
				totalInc : 0,
				totalExp : 0,
				percentage : -1
			});
			setupUiController();
		}
	}
	
})(BudgetController, UiController);

Controller.init();