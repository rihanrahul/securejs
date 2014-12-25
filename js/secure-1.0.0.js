/*
 * jQuery Form Validation Plugin
 * https://github.com/rihanrahul/securejs
 *
 * Copyright 2014, Rahul Maroli
 * https://jqueryfx.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */


;(function($, window, document, undefined) {
		
	var Secure = function(elem,options){
		var _this = this;
		_this.elem = elem;
		_this.options = $.extend({},_this.config,options.settings);//extending the configurations so that you can change the configuration later;
		_this.msgs = $.extend({},_this.messages,options.messages);//extending the configurations so that you can change the configuration later;
		_this.init();
	}
	
	Secure.prototype.config = {//initial configurations
		
		showTips 		: 	true,//set as false if you dont want to show the success error msgs. but still show the red & green border indications
		theme			: 	'tooltip',
		submitType 		: 	'normal',//options 'normal' & 'ajax'. change to 'ajax' if you are using ajax form processing
		onSuccess 		: 	$.noop,//$.noop is an empty func. if you are using ajax, you can create a func and put the func name here, () not required
		minPassLen 		: 	4,//minimum password length if you are using the password strngth checker( should an integer)
		medPassLen 		: 	6,//medium password length if you are using the password strngth checker( should be an integer)
		strongPassLen 	: 	8,//strong password length if you are using the password strngth checker( should be an integer)
		dateFormat 		: 	'yyyy-mm-dd'//prefered date format, available options : 'mm-dd-yyyy', 'mm/dd/yyyy', 'dd-mm-yyyy', 'dd/mm/yyyy'
	},
		
	Secure.prototype.events = {
		input 		: 'focusout keyup',
		select 		: 'focusout change',
		textarea 	: 'focusout keyup'
	},

	Secure.prototype.css_classes = {
		form  	: 'secure-form',
		wrap  	: 'secure-elem-wrap',
		msg  	: 'secure-validation-msg',
		success : 'secure-success',
		error 	: 'secure-error',
		reject 	: 'secure-reject',
	},
		
	Secure.prototype.init = function(){
		
		var _this = this;

		var count = $('.'+_this.css_classes.form).length;

		$(_this.elem).addClass(_this.css_classes.form+' '+_this.css_classes.form+(count+1));

		_this.options.showTips === true ? _this.wrap() : null;

		var elems = $(_this.elem).find('[data-secure]');

		elems.each(function(i){
			_this.check_reject($(this));
		});
		
		_this.init_events();
				
	},

	Secure.prototype.check_reject = function(elem){
		var _this = this;
		var data = elem.data('secure');
		data.indexOf('presence') !== -1 ? $(elem).addClass(_this.css_classes.reject) : null;
	},

	Secure.prototype.wrap = function(){
		var _this = this;
		var elems = $(_this.elem).find('[data-secure]');
		elems.wrap("<div/>").parent('div').addClass(_this.css_classes.wrap);
		$('<div/>').insertAfter(elems).fadeOut(0).addClass(_this.css_classes.msg);
		_this.apply_theme();
	},

	Secure.prototype.init_events = function(){
		var _this = this;

		$.each(_this.events, function(i,v){
			$(_this.elem).on(v,i,function(){
				$(this).trigger('checkout');
			});
		});
		
		$(_this.elem).on('submit',function(e){
			
			if($(this).find('.'+_this.css_classes.reject).length === 0){
				_this.submit(e);
			}
			else{
				e.preventDefault();
				for(i in _this.events){
					$(_this.elem).find(i).trigger('checkout');
				}
			}
			
		});
		
		for(i in _this.events){
			$(_this.elem).on('checkout',i,function(){
				var attr = $(this).attr('data-secure');
				typeof attr !== 'undefined' && attr !== false ? _this.check($(this)) : null;
			});
		}
	},

	Secure.prototype.submit = function(e){
		var _this = this;
		
		if(_this.options.submitType === 'ajax'){
			e.preventDefault();
			($.isFunction(_this.options.onSuccess)) ? _this.options.onSuccess() : $.noop;
		}
		_this.log('submitted');
	},
	
	Secure.prototype.check = function(elem){
		var _this = this;
		_this.check_reject(elem);
		elem.next('.'+_this.css_classes.msg).removeClass(_this.css_classes.success+' '+_this.css_classes.error).fadeOut(0);
		var secure = elem.data('secure');
		secure = secure.split(' ');
		$.each(secure, function(i,v){
			var u = v.indexOf('[') !== -1 ? v.substring(0,v.indexOf("[")) : v;
			typeof _this[u] === 'function' ? _this[u](elem,_this.clean(v)) : _this.log(u+'() not defined');
			if(elem.hasClass(_this.css_classes.reject)) return false;
		});
	},
	
	Secure.prototype.log = function(msg){
		'console' in window ? console.log(msg) : alert(msg);
	},

	Secure.prototype.clean = function(val){
		return val.indexOf("[") !== -1 && val.indexOf("]") !== -1 ? val.substring(val.indexOf("[")+1,val.indexOf("]")) : val;
	},
	
	Secure.prototype.presence = function(elem){
		var _this = this;
		var res = elem.val().replace(/\s+/g, '').length > 0 ? [true,_this.msgs.success] : [false,_this.msgs.presence];
		_this.show_result(elem,res);
	},

	Secure.prototype.minimum = function(elem,min){
		var _this = this;
		var length = elem.val().replace(/\s+/g, '').length;
		if(length == 0) return;
		var minLength = _this.msgs.minLength.replace('{{min}}',min);
		var res = elem.val().replace(/\s+/g, '').length < min ? [false,minLength] : [true,_this.msgs.success];
		_this.show_result(elem,res);
	},

	Secure.prototype.maximum = function(elem,max){
		var _this = this;
		var length = elem.val().replace(/\s+/g, '').length;
		if(length == 0) return;
		var maxLength = _this.msgs.maxLength.replace('{{max}}',max);
		var res = length > max ? [false,maxLength] : [true,_this.msgs.success];
		_this.show_result(elem,res);
	},

	Secure.prototype.between = function(elem,range){
		var _this = this;
		var length = elem.val().replace(/\s+/g, '').length;
		if(length == 0) return;
		range = range.split('-');
		if(isNaN(range[0]) || isNaN(range[1] || range[1] < range[0])){
			return;
		}
		var msg = _this.msgs.between.replace('{{min}}',range[0]).replace('{{max}}',range[1]);
		var res = length < range[0] || length > range[1] ? [false,msg] : [true,_this.msgs.success];
		_this.show_result(elem,res);
	},

	Secure.prototype.alphabetic = function(elem){
		var _this = this;
		var str = elem.val().replace(/\s+/g, '');
		if(str.length == 0) return;
		var res = !/^[a-zA-Z]+$/.test(str) ? [false,_this.msgs.alpha] : [true,_this.msgs.success];//checking if value contains only alphabetic characters
		_this.show_result(elem,res);
	},

	Secure.prototype.alphanumeric = function(elem){
		var _this = this;
		var str = elem.val().replace(/\s+/g, '');
		if(str.length == 0) return;
		var res = !/^[a-zA-Z0-9]+$/.test(str) ? [false,_this.msgs.alphaNumeric] : [true,_this.msgs.success];//checking if value contains only alphanumeric characters
		_this.show_result(elem,res);
	},

	Secure.prototype.numeric = function(elem){
		var _this = this;
		var val = elem.val();
		if(val.length == 0) return;
		var res = isNaN(val) || val.indexOf('.') !== -1 ? [false,_this.msgs.number] : [true,_this.msgs.success];//checking if value contains only numbers
		_this.show_result(elem,res);
	},

	Secure.prototype.float = function(elem){
		var _this = this;
		var val = elem.val();
		if(val.length == 0) return;
		var res = !/^[-0-9.]+$/.test(val) ? [false,_this.msgs.float] : [true,_this.msgs.success];//checking if value contains only numbers
		_this.show_result(elem,res);
	},

	Secure.prototype.lessthan = function(elem,limit){
		limit = parseFloat(limit);
		var _this = this;
		var val = elem.val();
		if(val.length == 0) return;
		if(isNaN(val)){
			var res = [false,_this.msgs.number];
		}
		else{
			var msg = _this.msgs.lessthan.replace('{{val}}',limit);
			var res = val > limit ? [false,msg] : [true,_this.msgs.success];
		}
		_this.show_result(elem,res);
	},

	Secure.prototype.greaterthan = function(elem,limit){
		limit = parseFloat(limit);
		var _this = this;
		var val = elem.val();
		if(val.length == 0) return;
		if(isNaN(val)){
			var res = [false,_this.msgs.number];
		}
		else{
			var msg = _this.msgs.greaterthan.replace('{{val}}',limit);
			var res = val < limit ? [false,msg] : [true,_this.msgs.success];
		}
		_this.show_result(elem,res);
	},

	Secure.prototype.range = function(elem,range){
		var _this = this;
		var val = elem.val();
		if(val.length == 0) return;
		range = range.split('-');
		if(isNaN(range[0]) || isNaN(range[1] || range[1] < range[0])){
			return;
		}
		var msg = _this.msgs.range.replace('{{min}}',range[0]).replace('{{max}}',range[1]);
		var res = val < range[0] || val > range[1] ? [false,msg] : [true,_this.msgs.success];
		_this.show_result(elem,res);
	},

	Secure.prototype.match = function(elem,matcher){
		var _this = this;
		var val = elem.val();
		var matchSel = $(_this.elem).find('input[name='+matcher+']');//find the element given to match with		
		if (!matchSel) return;//return if not found element
		if (matchSel.val().length == 0 && val.length == 0) return;
		var res = val !== matchSel.val() ? [false,_this.msgs.matchError] : [true,_this.msgs.matchSuccess];
		_this.show_result(elem,res);
	},

	Secure.prototype.strength = function(elem){
		var _this = this;
		var val = elem.val();
		if(val.length==0) return;
		minPassLen = (isNaN(_this.options.minPassLen) ? 4 : _this.options.minPassLen);//if min length is not a number in settings, take 4 as min len
			
		medPassLen = (isNaN(_this.options.medPassLen) ? 6 : _this.options.medPassLen);//if med length is not a number in settings, take 6 as med len
		
		strongPassLen = (isNaN(_this.options.strongPassLen) ? 8 : _this.options.strongPassLen);//if strong is not a number in settings, take 8 as strong
		
		strong = new RegExp("^(?=.{"+strongPassLen+",})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
		
		medium = new RegExp("^(?=.{"+medPassLen+",})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
		
		enough = new RegExp("(?=.{"+minPassLen+",}).*", "g");
		
		minLen = _this.msgs.minLength.replace('{{min}}',minPassLen);//replacing {{min}} with given min length in settings

		if (enough.test(val) === false) {
			var res = [false,minLen];
		}
		else if(strong.test(val)){
			var res = [true,_this.msgs.strongPass];
		}
		else if(medium.test(val)){
			var res = [true,_this.msgs.mediumPass];
		}
		else{
			var res = [true,_this.msgs.weakPass];
		}
		_this.show_result(elem,res);
	},

	Secure.prototype.url = function(elem){
		var _this = this;
		var val = elem.val();
		if(val.length==0) return;
		var url_regexp = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");//regexp for validating url
		var res = (!url_regexp.test(val)) ? [false,_this.msgs.url] : [true,_this.msgs.success];//if not a url show error else show success
		_this.show_result(elem,res);
	},

	Secure.prototype.email = function(elem){
		var _this = this;
		var val = elem.val();
		if(val.length==0) return;
		var email_regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;//regexp for checking email
		var res = (!email_regexp.test(val)) ? [false,_this.msgs.email] : [true,_this.msgs.success];
		_this.show_result(elem,res);
	},

	Secure.prototype.show_result = function(elem,result){
		var _this = this;
		elem.next('.'+_this.css_classes.msg).text(result[1]);
		result[0] === true ? elem.removeClass(_this.css_classes.reject).next('.'+_this.css_classes.msg).removeClass(_this.css_classes.error).addClass(_this.css_classes.success).fadeIn(0) : elem.addClass(_this.css_classes.reject).next('.'+_this.css_classes.msg).removeClass(_this.css_classes.success).addClass(_this.css_classes.error).fadeIn(0);
	},
	
	Secure.prototype.apply_theme = function(){
		var _this = this;
		var wrap_css = '.'+_this.css_classes.wrap+'{position:relative;}';
		_this.tooltip_css = '.'+_this.css_classes.msg+'{position:absolute;padding:8px; color:#fff; line-height:10px !important; }.'+_this.css_classes.msg+':before{content:""; position:absolute; left:-7px; top:7px; width:0; height:0;}.'+_this.css_classes.msg+'.'+_this.css_classes.error+'{background:#f00f00; box-shadow:0 0 3px #bbb; border-radius:3px; font-size:10px;}.'+_this.css_classes.msg+'.'+_this.css_classes.error+':before{border-right:7px solid #f00f00; border-bottom: 7px solid transparent; border-top:5px solid transparent;}.'+_this.css_classes.msg+'.'+_this.css_classes.success+'{background:#6ac024; box-shadow:0 0 3px #bbb; border-radius:3px; font-size:10px;}.'+_this.css_classes.msg+'.'+_this.css_classes.success+':before{border-right:7px solid #6ac024; border-bottom: 7px solid transparent; border-top:5px solid transparent;}';
		_this.default_css = '';

		var theme = typeof _this.options.theme === 'undefined' ? 'default' : _this.options.theme;

		var css = '<style id="secure-'+_this.options.theme+'-theme">'+wrap_css+_this[theme+'_css']+'</style>';

		$('#secure-'+_this.options.theme+'-theme').length === 0 ? $('body').append(css) : null;
				
	}
		
	
	Secure.prototype.messages = {
		
		success 	 : 	'This field is ok!',
		presence 	 : 	'Required Field!',
		email		 : 	'Must be an email!',
		number 		 : 	'Must be a number!',
		float 		 : 	'Must be a float number!',
		alphaNumeric : 	'Alpha numeric only!',
		alpha 		 : 	'Alphabetic only!',
		creditCard 	 : 	'Enter credit card number correctly',
		weakPass	 :  'Your password is very weak!',
		mediumPass	 :	'Your password is medium!',
		strongPass	 :	'Your password is strong',
		minLength	 :	'Minimum {{min}} characters.',
		maxLength	 :	'Maximum {{max}} characters.',
		lessthan	 :	'Must be less than {{val}}.',
		greaterthan	 :	'Must be greater than {{val}}.',
		range		 :	'Value must be in between {{min}} and {{max}}',
		minSel		 :	'Minimum {{min}} options should be selected.',
		minSel		 :	'Maximum {{max}} options allowed to be selected.',
		minChecked	 :	'Minimum {{min}} options should be checked.',
		minChecked	 :	'Maximum {{max}} options allowed to be checked.',
		url			 :  'Enter a valid url.',
		date		 :	'Enter a valid a date.',
		between		 :	'Length must be in between {{min}} and {{max}}',
		matchError	 :	'Passwords do not match',
		matchSuccess :	'Passwords matches',
		maxFileSize	 :	'Maximum file size {{maxSize}}',
		minFileSize	 :	'Minimum file size {{minSize}}',
		imgWidth	 :	'Image width must be {{imgWidth}}px',
		imgHeight	 :	'Image height must be {{imgHeight}}px',
		imgMinWidth	 :	'Minimum image width must be {{imgMinWidth}}px',
		imgMinHeight :	'Minimum image height must be {{imgMinHeight}}px',
		imgMaxWidth	 :	'Maximum image width must be {{imgMaxWidth}}px',
		imgMaxHeight :	'Maximum image height must be {{imgMaxHeight}}px',
	};
	
	$.fn.secure = function(options){
		
		return this.each(function(){
			
			new Secure(this,options);
			
		});
		
	};
	
})(jQuery, window, document);