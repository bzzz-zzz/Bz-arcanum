// ==UserScript==
// @name     			Arcanum Script by Bz
// @version  			1
// @grant    			none
// @author				Bz
// @match					http://www.lerpinglemur.com/arcanum/
// @match					https://game312933.konggames.com/gamez/0031/2933/*
// @run-at 				document-idle
// ==/UserScript==
//
console.log("Arcanum Script by Bz has started");

var _current_tab = "";
var _action_buttons = new Map();
var _adventure_buttons = new Map();
var _flee_button; //used to cancel adventure loop

var _autoclick_action = false;
var _autoclick_adventure = false;
var _focus_button = false;

var _timer_automate = 100;
var _do_logs = 2;
var _testing = 0;

class ActionButton{
  	//vars: button, type, has_auto, toggle, autoclick
  	//type: action, adventure
  	constructor(button, type)
  	{
    		this.button = button;	
      	this.type = type;
      
        let key = this.getName();
      	
      	switch(this.type)
        {
          	case "action":
                if (!_action_buttons.has(key))      
      					_action_buttons.set(key, this);
            		break;
            case "adventure":
								if (!_adventure_buttons.has(key))      
      					_adventure_buttons.set(key, this);
            		break;
        }
      
      	this.makeToggle();
    }
  	makeToggle()
  	{
      	if(!this.has_auto)
        {
          	this.has_auto = true;
    				var toggle = document.createElement("button");
          	toggle.innerHTML = "A";
            switch(this.type)
            {
                case "action":
                    toggle.classList.add("wrapped-btn");
                    toggle.style.flexGrow = 0.2;
                    break;
                case "adventure":
                    		toggle.classList.add("raid-btn");
                    break;
            }

          	toggle.addEventListener("click", this.btnClicked.bind(this));
          	this.toggle = toggle;
        }
        this.appendToggle();
    }
  	appendToggle()
  	{
        switch(this.type)
        {
          	case "action":
    						return this.button.appendChild(this.toggle);
            case "adventure":
								return this.button.firstChild.firstChild.appendChild(this.toggle);
        }
    }
  	getWrappedButton()
  	{
      	switch(this.type)
        {
          	case "action":
    						return this.button.querySelector(":scope .wrapped-btn");
            case "adventure":
								return this.button.querySelector(":scope .separate .raid-btn");
        }
    }  
  	getName()
  	{
      	//console.log(this);
        return this.getWrappedButton().innerHTML.toLowerCase();
    }
  	btnClicked()
  	{
				if(this.autoclick)
        {
            if(_do_logs >= 2) console.log("Autoclick stop");
        		this.autoclick = false;
          	this.toggle.style.fontWeight = "normal";
          	this.toggle.innerHTML = "a";
          	switch(this.type)
        		{
          			case "action":
    								_autoclick_action = false;
                		break;
            		case "adventure":
										_autoclick_adventure = false;
                		break;
        		}
        }
      	else
        {
            if(_do_logs >= 2) console.log("Autoclick start");
          	var collection;
            switch(this.type)
        		{
          			case "action":
    								collection = _action_buttons;
                		break;
            		case "adventure":
										collection = _adventure_buttons;
                		break;
        		}
          
      			collection.forEach(function(item){
								item.autoclick = false;
              	item.toggle.style.fontWeight = "normal";
              	item.toggle.innerHTML = "A";
						});
      			this.autoclick = true;
            this.toggle.style.fontWeight = "bold";
          	this.toggle.innerHTML = "A*";
          	console.log(this);
            switch(this.type)
        		{
          			case "action":
    								_autoclick_action = this.getWrappedButton();
                		break;
            		case "adventure":
										_autoclick_adventure = this.getWrappedButton();
                		setTimeout(function()
                    {
                		var flee = document.querySelector("div.game-main div.adventure div.explore .raid-btn")
                				.addEventListener("click", function(){
												_autoclick_adventure = false;
										});                               
                    }, 1000);
                		break;
        		}
        }
    }
}

function _get_tab_name()
{
    var regExp = /<u>/;
    for (let tab of document.querySelectorAll("div.menu-items div.menu-item span"))
    {
        var name = tab.innerHTML;
        if(! regExp.test(name))
        {
            name = name.trim();
            if(_testing >= 4) console.log("Active menu tab: " + name);
            break;
        }  
    }
  return name;
}

/////////////////// FIREFOX STYLE WORKAROUND
function getComputedStyleCssText(element) {
  var style = window.getComputedStyle(element);
 	let cssText;
  if (style.cssText != "") {
    return style.cssText;
  }
 
  cssText = "";
  for (var i = 0; i < style.length; i++) {
    cssText += style[i] + ": " + style.getPropertyValue(style[i]) + "; ";
  }
  
  return cssText;
}

/////////////////// START REST IF NOTHING IS HAPPENING
function _auto_rest()
{
  	let vitals = document.querySelector("div.vitals");
		let full = true;
  
		//Action is running, return
  	if(! vitals.querySelector(":scope div.running").innerHTML == "") return;
  	if(_testing >= 2) console.log("Running: " + false);	

  	//Full bars, don't rest, return
  	for (let qs of vitals.querySelectorAll(":scope table.bars div.fill"))
    {
      	if(qs.style.width.match(/\d+/)[0] < 100)
          	full = false;
      		if(_testing >= 3) console.log("Bars: ");
      		if(_testing >= 3) console.log(qs.style.width.match(/\d+/)[0]);                                 
    }
		if(_testing >= 1) console.log("Auto rest full: " + full);

  	if(full) return;
  
  	//Start resting
  	for (let qs of vitals.querySelectorAll(":scope div.separate button.btn-sm"))
    {
      	if(_testing >= 2)console.log("Test: " + qs.innerHTML.trim() == "rest");
        if(qs.innerHTML.trim() == "rest")
        {
		        qs.click();
          	if(_do_logs >= 2) console.log("Auto rest: Resting started");
        }  
    }
  	
}

function _get_focus_button()
{
		for (let qs of document.querySelectorAll("div.vitals .separate .btn-sm"))
    {
      	if(qs.innerHTML.trim().toLowerCase() == "focus")
        {
    				//console.log(qs.innerHTML.trim().toLowerCase());
    				_focus_button = qs;
        }
    }
}


/////////////////// AUTOCLICK TOGGLE ACTION BUTTONS
function _action_btn_auto()
{
  	if(_get_tab_name() != "main") return;

		var action_list_1 = document.querySelector("div.game-mid div.main-actions div.action-list");
  
  	for (let qs of action_list_1.querySelectorAll(":scope .action-btn:not(.locked)"))
    {
        //console.log(qs);
      	var btn = new ActionButton(qs, "action");
    }		
}

/////////////////// AUTOCLICK TOGGLE DUNGEON BUTTONS
function _dungeon_btn_auto()
{
  	if(_get_tab_name() != "adventure") return;

  	for (let qs of document.querySelectorAll("div.game-mid div.adventure div.locales div.dungeon"))
    {
        //console.log(qs);
      	var btn = new ActionButton(qs, "adventure");
    }		
}


/////////////////// ADDS QUICKSLOT BUTTONS NEXT TO ORIGINAL 10, NOT USED
function _make_quickslot_button(text, callback)
{  
  	var div1 = document.querySelector("div.quickslot");
		var s1 = getComputedStyleCssText(div1);
  	var div2 = document.querySelector("div.quickslot > div");
		var s2 = getComputedStyleCssText(div2);
		var ndiv1 = document.createElement("div");
    ndiv1.style = s1;
  	var ndiv2 = document.createElement("div");
    ndiv2.style = s2;
  	ndiv2.innerHTML = text;
  	ndiv1.appendChild(ndiv2);
  	//TODO add callback
  	//ndiv1.addEventListener("click", this.btnClicked.bind(this));
  	return ndiv1;
}

function _add_quickslot_buttons()
{
    var quick_bar = document.querySelector("div.quickbar");
		//quick_bar.appendChild(_make_quickslot_button("Text", null));
}

/////////////////// TIMERS, AUTOMATION
function _tab_changed()
{
  	let retval = _get_tab_name() != _current_tab;
  	_current_tab = _get_tab_name();
  	return retval;
}
/*
/////////////////// REQUIRES WAITING FOR PAGE LOAD / ORIGINAL JS EXECUTION
setTimeout(function()
{
  	console.log("If you see this before gameLoaded() things are probably going to break.");
		_add_quickslot_buttons();
}, 4000);
*/
var __timer_automate = window.setInterval
(
	function()
  {
    if(_autoclick_action)
    {
    		_autoclick_action.click();
    }
    if(_autoclick_adventure)
    {
    		_autoclick_adventure.click();
    }
    _auto_rest();
    if(_focus_button)
    {
    		_focus_button.click(); //_focus_button.click(); _focus_button.click();
    }
    else
    {
    		_get_focus_button();
    }
    if(_tab_changed())
    {
				_action_btn_auto();
				_dungeon_btn_auto();
    }
  },
  _timer_automate
);

