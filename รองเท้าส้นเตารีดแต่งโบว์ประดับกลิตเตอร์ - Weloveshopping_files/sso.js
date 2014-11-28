(function(w){
	//indexOf polyfill
	Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){if(void 0===this||null===this)throw new TypeError('"this" is null or not defined');var c=this.length>>>0;for(b=+b||0,1/0===Math.abs(b)&&(b=0),0>b&&(b+=c,0>b&&(b=0));c>b;b++)if(this[b]===a)return b;return-1});
	//use for get script
	var getScript=function(a,b){var c=document.createElement("script"),d=document.getElementsByTagName("head")[0],e=!1;c.src=a,c.onload=c.onreadystatechange=function(){e||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(e=!0,b(),c.onload=c.onreadystatechange=null,d.removeChild(c))},d.appendChild(c)};

    //fixed window.location.origin in IE7
    w.location.origin||(w.location.origin=w.location.protocol+"//"+w.location.hostname+(w.location.port?":"+w.location.port:""));

	/*! Cookies.js - 0.4.0; Copyright (c) 2014, Scott Hamper; http://www.opensource.org/licenses/MIT */
	(function(e){"use strict";var b=function(a,d,c){return 1===arguments.length?b.get(a):b.set(a,d,c)};b._document=document;b._navigator=navigator;b.defaults={path:"/"};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();return b._cache[a]};b.set=function(a,d,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(d===e?-1:c.expires);b._document.cookie=b._generateCookieString(a,d,c);return b};b.expire=function(a,d){return b.set(a,e,d)};b._getExtendedOptions=function(a){return{path:a&& a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==e?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};b._getExpiresDate=function(a,d){d=d||new Date;switch(typeof a){case "number":a=new Date(d.getTime()+1E3*a);break;case "string":a=new Date(a)}if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance"); return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCookieObjectFromString=function(a){var d={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var f=b._getKeyValuePairFromCookieString(a[c]); d[f.key]===e&&(d[f.key]=f.value)}return d};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b;return{key:decodeURIComponent(a.substr(0,b)),value:decodeURIComponent(a.substr(b+1))}};b._renewCache=function(){b._cache=b._getCookieObjectFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();"function"===typeof define&& define.amd?define(function(){return b}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports.Cookies=b):window.Cookies=b})();

	var SSO = function(){
		var enabled_cross_check = false,
            regex = /\.loc|\.in|\.com/,
			dot = regex.exec(location.host) || '.in',
            protocol = 'http';

            if (dot == '.com') {
                protocol = 'https'
            }

		var portal_path = 'http://portal.weloveshopping.com',
			acc_path = 'https://account.weloveshopping.com',
			active_lang = 'th',
			a_day = 86400,
			// define cookie name
			default_lang = 'th',
			lang_cookie = 'active_lang',
			uid_cookie = 'uid',
			access_token_cookie = 'access_token',
			onetime_token_cookie = 'onetime_token',
			uid = Cookies.get(uid_cookie);
			access_token = Cookies.get(access_token_cookie);
			onetime_token = Cookies.get(onetime_token_cookie);
			$head = $('head');

	    var renderLogin = function(response){
		    var div = $('#bar_user_action');
		    var html = '<div class="box-user-action"><div class="line">|</div>';
            var totalShop = 0;
            var shopTitle = 'ร้านค้าของฉัน';

            if (response.storev1) {
                totalShop++;
                html += '<a href="http://www.weloveshopping.com/authen" rel="nofollow" target="_blank">' + shopTitle + '</a><div class="line">|</div>';
            }

            if (response.admin) {
                totalShop++;
                if (totalShop >= 2)
                    shopTitle += ' 2';

                html +='<a href="' + response.admin + '" rel="nofollow" target="_blank">' + shopTitle + '</a><div class="line">|</div>';
            }

		    html +='<div class="box-dropdown" id="topbar_user_widget_container">';
            html +='<a class="cursor-pointer" id="topbar_user_widget">บัญชีของฉัน</a>';
		    html +='<ul>';
            html +='<li><a href="' + acc_path + '/profile/report/buyer">รายการสั่งซื้อ</a></li>';
		    html +='<li><a href="' + acc_path + '/profile">ข้อมูลส่วนตัว</a></li>';
		    html +='<li><a href="' + acc_path + '/logout?ref=' + document.URL + '">ออกจากระบบ</a></li>';
		    html +='</ul>';
		    html +='</div>';

		    html +='</div>';

		    html +='<div class="box-user-info">';
		    html +='<div class="display pull-left"><img src="' + response.info.avatar + '"></div>';
		    html +='<a class="pull-left">' + response.info.username +'</a>';
		    html +='</div>';

		    div.empty().append(html);


            setTimeout(function(){
                $('#shop-menu').on('click', function(e){
                    $("#subshop").css('display','');
                });

                $('#topbar_user_widget')
                    .on('click', function(){
                        $(this).closest('#topbar_user_widget_container').addClass('open');
                    });

                $('body')
                    .on('mouseenter','#topbar_user_widget_container',function(){
                        $(this).addClass('open');
                    })
                    .on('mouseleave','#topbar_user_widget_container ul',function(){
                        $('#topbar_user_widget_container').removeClass('open');
                    })
                    .on('mouseleave','#portal-bar',function(){
                        $('#topbar_user_widget_container').removeClass('open');
                    });
            },300);
		    // $(html).appendTo(div);
		}

		var renderNoLogin = function(html)
		{
		    var div = $('#bar_user_action');
		    var html ='';

		    html +='<div class="box-user-action">';
		    // html +='<a href="' + acc_path + '?ref=' + document.URL + '" class="text-action">เข้าสู่ระบบ</a>';
            html +='<a href="' + acc_path + '?ref=' + document.URL + '" class="text-action">เข้าสู่ระบบ</a>';
		    html +='<div class="line">|</div>';
		    html +='<a href="' + acc_path + '/signup/user" class="text-action">สมัครสมาชิก</a>';
		    html +='</div>';

		    div.empty();
		    $(html).appendTo(div);
		}

		var onSuccess = function(response){
				if (!$head.length) {
					alert('head Tag not found.');
					return;
				}
                //console.log(response);

			    if(typeof(response.status) != 'undefined')
			    {
			        if(response.status > 0)
			        {
			            // is logged in sso
			            if(uid != null && access_token != null)
			            {
			                // logged in
			                renderLogin(response);
			            }
			            else if(enabled_cross_check == false && (access_token == null && (uid != null && onetime_token != null))) {
			                // only onetime
			                location.reload();
			            }
			            else {
			                Cookies.set(uid_cookie, response.uid, { expires: a_day });
			                Cookies.set(onetime_token_cookie, response.onetime_token, { expires: a_day });
			                if(enabled_cross_check == false) Cookies.set(access_token_cookie, response.access_token, { expires: a_day });

			                location.reload();
			            }

			        }
			        else {
			            // is logout (unset cookie)
			            Cookies.expire(uid_cookie);
			            Cookies.expire(onetime_token_cookie);
			            Cookies.expire(access_token_cookie);
			            renderNoLogin(response);
			        }
			    }

			    // set language
			    /*if(typeof(response.lang) != 'undefined' && response.lang != '')
			    {
			        // define js global lang
			        active_lang = response.lang;

			        // get current language cookie
			        var curr_lang = Cookies.get(lang_cookie);
			        if(curr_lang != response.lang)
			        {
			            Cookies.set(lang_cookie, response.lang, 10, '/', '', '');
                        location.reload();
			        }
			    }
			    else {
			        Cookies.expire(lang_cookie, default_lang);
			    }*/
			},
			onError = function(){

			};


		$.ajax({
            url: acc_path + '/auth',
            jsonp: "callback", // the name of the callback parameter, as specified by the YQL service
            dataType: "jsonp", // tell jQuery we're expecting JSONP
            data: { access_token: access_token },
            success: onSuccess,
            error: onError
        });
	};

	//check jQuery
	if (jQuery || $)
        $( document ).ready(function(){
            SSO();
        });
	else {
		//fallback if jquery is not present.
		getScript('//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js', function(){
            $( document ).ready(function(){
                SSO();
            });
		});
	}

})( window );