!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function c(a){return h.raw?a:encodeURIComponent(a)}function d(a){return h.raw?a:decodeURIComponent(a)}function e(a){return c(h.json?JSON.stringify(a):String(a))}function f(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(b," ")),h.json?JSON.parse(a):a}catch(c){}}function g(b,c){var d=h.raw?b:f(b);return a.isFunction(c)?c(d):d}var b=/\+/g,h=a.cookie=function(b,f,i){if(arguments.length>1&&!a.isFunction(f)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[c(b),"=",e(f),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=b?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=d(p.shift()),r=p.join("=");if(b&&b===q){l=g(r,f);break}b||void 0===(r=g(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});
(function(w, $){
    var filter,
        cart;

    //fixed window.location.origin in IE7
    if ( !w.location.origin ) {
        w.location.origin = w.location.protocol +
            '//' +
            w.location.hostname +
            ( w.location.port ? ':' + w.location.port: '' );
    }

    w.getPathType = function(pathName){
        pathName = pathName || w.location.href;
        pathName = pathName.replace(w.location.origin, '');

        var map = ['category','category/shop','search','search/shop'],
            regex = /(^\/[0-9]+-.+)|(^\/shop-category\/[0-9]+-.+)|(^\/search.+)|(^\/shop\/.+)/,
            type = regex.exec( pathName ) || [];

        if (type.length) {
            //remove first match
            type.shift();
            //get type from map
            _.forEach(type, function(v,k){
                if (v !== undefined)
                    type = map[k];
            });
            return type;
        }
        return false;
    };

    var Portal = function() {};

    //require new portal.location('/search')
    Portal.prototype.filter = function(loc) {
        var filterSeperate = ',';

        this.getCurrentFilter = function(){
            var search = loc.getSearch(),
                resultParams = {},
                v;

            if ( search && search.f ) {
                resultParams = _.reduce(search.f.split(filterSeperate), function(result, value) {
                    v = value.split(':');
                    if ( v.length ) result[v[0]] = v[1];
                    return result;
                }, {});
            }
            return resultParams;
        };
        var that = this;

        var joinFilter = function(filter){
            if ( _.isEmpty(filter) ) {
                return null;
            }
            if ( _.isObject(filter) ) {
                var result = _.reduce(filter, function(result, value, key){
                    result.push( key + ':' + value );
                    return result;
                }, []);
                return result.join(filterSeperate);
            }

            return false;
        };

        //find filter by price
        var $filterContainer = $('#pushstate-filter-tool'),
            FIXED_PRICE      = '.filter-fixed-price',
            SORT             = '.filter-sort',
            VIEW             = '.filter-view',
            PLAZA            = '.filter-plaza',
            RANGE_PRICE      = '.filter-range-price',
            WETRUST          = '.filter-wetrust';

        var filterByPrice = function(){
            var p        = that.getCurrentFilter(),
                $this    = $(this),
                $a       = $this.find('a'),
                minPrice = $a.data('min-price') || 0,
                maxPrice = $a.data('max-price') || 0;

            if ( $this.hasClass('active') ) {
                if (p.min) delete p.min;
                if (p.max) delete p.max;
            } else {
                if ( minPrice > 0 )
                    p.min = minPrice;
                else
                    delete p.min;

                if ( maxPrice > 0 )
                    p.max = maxPrice;
                else
                    delete p.max;
            }

            var resetPage = true;

            loc.search('f', joinFilter(p), true, resetPage);
        };

        var sortBy = function(e){
            var p      = that.getCurrentFilter(),
                $this  = $(this),
                $a     = $this.find('a'),
                sortBy = $a.data('sort-by') || '',
                dir    = $a.data('dir') || 'desc';

            if ( $a.hasClass('no-action') ) {
                e.preventDefault();
                $this.find('ul').show();
                return;
            }

            if ( sortBy === '' ) {
                delete p.order;
                delete p.sort;
            } else {
                p.order = sortBy;
                p.sort  = dir;
            }

            loc.search('f', joinFilter(p), true);
        };

        var viewMode = function(){
            var p     = that.getCurrentFilter(),
                $this = $(this);//,
                // classToRemove,
                // classToAdd;

            p.view = $this.data('view') || '';

            if (p.view === '') delete p.view;

            loc.search('f', joinFilter(p), true);
        };

        var plaza = function(){
            var p        = that.getCurrentFilter(),
                $this    = $(this),
                selected = $this.find('option:selected').val();

            if (selected > 0)
                p.pci = selected;
            else
                delete p.pci;

            loc.search('f', joinFilter(p), true);
        };

        var blurClick = function(e){
            var target      = e.target || e.srcElement,
                $rangePrice = $filterContainer.find( RANGE_PRICE );

            if ( $(target).closest('.filter-range-price').length ) {
                $rangePrice.addClass('show');
            } else {
                $rangePrice.removeClass('show');
                $(w).unbind('click', blurClick);
            }
        };

        var rangeOnFocus = function(){
            var $rangePrice = $filterContainer.find( RANGE_PRICE );
            if ( !$rangePrice.hasClass('show') ) {
                $rangePrice.addClass('show');
                $(w).bind('click', blurClick);
            }
        };

        var rangeOnKeydown = function(e){
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                 // Allow: Ctrl+A or Cmd+A
                (keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                 // Allow: home, end, left, right
                (keyCode >= 35 && keyCode <= 39)) {
                     // let it happen, don't do anything
                     return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (keyCode < 48 || keyCode > 57)) && (keyCode < 96 || keyCode > 105)) {
                e.preventDefault();
            }
        };

        var rangeOnKeyup = function(e){
            var keyCode     = (e.keyCode ? e.keyCode : e.which),
                $rangePrice = $filterContainer.find( RANGE_PRICE );
            if ( keyCode == 13 ) {
                $rangePrice.find('button').trigger('click');
            }
        };

        var validateRangePrice = function(min, max){
            var regex      = /^\d+$/,
                isError    = false,
                errorStack = [];

            if ( (min && regex.test(min)) || (max && regex.test(max)) ) {
                if ( min ) min = _.parseInt(min);
                if ( max ) max = _.parseInt(max);

                if ( max === 0 ) {
                    isError = true;
                    errorStack.push('ค่า max ต้องมากกว่า 0');
                }

                if ( _.isNaN(min) ) {
                    isError = true;
                    errorStack.push('ค่า min ต้องเป็นตัวเลขเท่านั้น');
                }

                if ( _.isNaN(max) ) {
                    isError = true;
                    errorStack.push('ค่า max ต้องเป็นตัวเลขเท่านั้น');
                }

                if ( max > 0 ) {
                    if ( min > max) {
                        isError = true;
                        errorStack.push('ค่า min ต้องมากกว่าค่า max');
                    }
                }

                if ( isError ) {
                    alert( errorStack.join('\n') );
                    return;
                }

                return {
                    min : min,
                    max : max
                };
            }
            return false;
        };

        var rangeOnClick = function(){
            var p           = that.getCurrentFilter(),
                $rangePrice = $filterContainer.find( RANGE_PRICE ),
                min         = $rangePrice.find('.input-min-price').val(),
                max         = $rangePrice.find('.input-max-price').val(),
                isValid     = validateRangePrice(min, max);

            if ( isValid ) {
                p.min = isValid.min;
                p.max = isValid.max;

                if ( p.min === '' ) delete p.min;
                if ( p.max === '' ) delete p.max;

                var resetPage = true;
                loc.search('f', joinFilter(p), true, resetPage);
            }
        };

        var showWetrust = function(){
            var p     = that.getCurrentFilter(),
                $this = $(this);
            if ( $this.is(':checked') ) {
                p.we = 1;
            } else {
                if ( p.we )
                    delete p.we;
            }

            var resetPage = true;
            loc.search('f', joinFilter(p), true, resetPage);
        };

        // if ( $fixedPrice.length ) $fixedPrice.on('click', 'li', filterByPrice);
        $filterContainer
            .on('click', FIXED_PRICE + ' li', filterByPrice)
            .on('click', SORT + ' li', sortBy)
            .on('mouseleave', '.sort-price', function(){
                var $this = $(this);
                if ( $(this).find('ul').is(':visible') )
                    $(this).find('ul').hide();
            })
            .on('click', VIEW + ' a', viewMode)
            .on('change', PLAZA, plaza)
            .on('focus', RANGE_PRICE + ' input', rangeOnFocus)
            .on('keydown', RANGE_PRICE + ' input', rangeOnKeydown)
            .on('keyup', RANGE_PRICE + ' input', rangeOnKeyup)
            .on('click', RANGE_PRICE + ' button', rangeOnClick)
            .on('click', WETRUST + ' input', showWetrust);
    };

    Portal.prototype.lazyLoad = function() {
        var THRESHOLD = 200;

        $('img.lazy-load').unveil(THRESHOLD);

        var triggerEvent = ['click', 'mouseenter'];

        //Fix lazyload not trigger in tab click
        //still bug in hot trend
        var func = function () {
            var $this = $(this),
                $targetImg = $this.find('.lazy-load');

            //lazy-load still exist don't unbind the event
            if ( !$targetImg.length ) {
                $this.removeClass('trigger_scroll').unbind(v, func);
            }

            setTimeout(function () {
                $targetImg.trigger('unveil');
            }, 0);
        };
        _.each(triggerEvent, function (v){
            $('.trigger_scroll[data-trigger-by=' + v + ']').bind(v, func);
        });


        return {
            trigger : function(target) {
                target.trigger('unveil');
            },
            register : function(target){
                // var onUnveiled = function(){
                //     $(this).load(function() {
                //         this.style.opacity = 1;
                //     });
                // };
                target.unveil(THRESHOLD);
            }
        };
    };

    Portal.prototype.cart = function() {
        var $element = $('.box-cart'),
            $noti = $element.find('#cart-noti'),
            _checker = function(){
                if ($noti.html() === 0) {
                    $noti.hide();
                } else {
                    $noti.show();
                }
            },
            _update = function(val){
                val = (val > 99)? '99+': val;
                $noti.removeClass('hide').hide().html(val).fadeIn(300);
                _checker();
            };

        _checker();

        return {
            flush : function(){
                $.ajax({
                    url : '/rest/cart.json',
                    method : 'GET',
                    dataType : 'JSON'
                })
                .done(function(response){
                    if ( response.total_quantity > 0 ) {
                        response.total_quantity_text = response.total_quantity;
                        response.total_quantity = (response.total_quantity > 99)? '99+':response.total_quantity;

                        $noti.text(response.total_quantity).removeClass('hide').slideDown();
                        //Update total for cart main page
                        var $cart = $('#total_cart_product');
                        if ( $cart.length ) {
                            $cart
                                .attr('data-value', response.total_quantity_text)
                                .text(response.total_quantity_text);
                        }
                    }
                }).fail(function(){
                    console.log('Error');
                });
            },
            get : function(){
                _checker();

                return parseInt($noti.html()) || 0;
            },
            add : function(val, fn){
                _update(this.get() + val);

                if (_.isFunction(fn)) fn();
            },
            update : function(val, fn){
                _update(val);

                if (_.isFunction(fn)) fn();
            },
            remove : function(val, fn){
                var i = this.get() - val;
                _update(i < 0 ? 0 : i);

                if (_.isFunction(fn)) fn();
            },
            clear : function(fn){
                _update(0);

                if (_.isFunction(fn)) fn();
            }
        };
    };

    Portal.prototype.productExtension = function() {
        var $shopInfo = $('.shop-info'),
            listShopId,
            request;

        if ( !$shopInfo.length ) {
            return;
        }

        listShopId = _($shopInfo).map(function (element) {
                return $(element).attr('data-store-id');
            })
            .unique()
            .toString();

        $.get( '/rest/store_extension.json', { id : listShopId } )
            .done( function(response) {
                if (response &&
                    response.data &&
                    response.data[0] &&
                    !_.isEmpty(response.data[0]))
                {
                    //info with oen tag
                    var info = ['<div class="pull-left shop-date">'];
                    var element;
                    var template = {};
                    template.info = '<i class="icon-orange-info" title="ร้านค้านี้ผ่านการตรวจสอบ"></i>';
                    template.wetrust    = '<i class="icon-orange-shield" title="ร้านนี้อยู่ในระบบการันตี WeTrust"></i>';
                    template.creditcard = '<i class="icon-orange-card" title=" รับชำระผ่านบัตรเครดิต"></i>';
                    template.shipping = '<i class="icon-orange-truck" title="ร้านนี้ผ่านการรับรอง"></i>';
                    template.feedback_score = '<div class="pull-right" once-if="product.store.feedback_score"><i class="icon-heart-red-step1"></i><span class="color-green"></span></div>';
                    _.each(response.data[0], function(value, key){
                        element =_( $shopInfo ).filter(function( target ) {
                                return $(target).attr('data-store-id') === key;
                            })
                            .map(function( target ) {
                                return $(target).find('.shop-detail');
                            });

                        //Add support method
                        info.length = 1;
                        info.push(template.info);
                        if ( value.support_method ) {
                            //clear array
                            _.each( value.support_method, function(value, key){
                                if (value){
                                    info.push(template[key]);
                                }
                            });
                        }
                        //Add close tag
                        info.push('</div>');
                        element.each( function(target){
                            target.append( info.join('') );
                        });

                        //Add feedback score
                        if ( value.feedback_score )
                            element.each( function(target){
                                    target.append( template.feedback_score );
                                });
                    });
                }
            })
            .fail( function() {
                //to something when fail
            });
    };

    Portal.prototype.queryParam = function(event,mode) {
        var Main = function(){
                var t = $(event.target),
                e = event;
                if(typeof mode == 'undefined'){
                    keepMode(t);
                }else {
                    enterPrice(t,e,mode);
                }
            },
            that = this;



        var getUrlVars = function(href) {
            href = href || (typeof href == 'undefined' || href === '')?window.location.search.substring(1):href;

            var vars = [], hash;
            var hashes = href.split('&');

            if(hashes !== ''){
                for(var i = 0; i < hashes.length; i++)
                {
                    hash = hashes[i].split('=');
                    vars[hash[0]] = hash[1];
                }
                return vars;
            }else{
                return [];
            }
        };

        var  keepQuery = function(param){
            var q = '';
            for(var key in param){
                q += '&'+key + '='+ param[key];
            }
            return q.substring(1);
        };

        var keepMode = function(t){
               var href = $(t).attr('data-href');
               //alert(href);
               var current = document.URL;
                var url =  href.substring(href.indexOf('?')+1);

                var param = getUrlVars();
                var paramNew = getUrlVars(url);
                var isActive = $(t).hasClass('active');
                ///Replace old value///
                for(var key in paramNew){
                    if(isActive){
                        delete param[key];
                    }else{
                        param[key] = paramNew[key];
                    }
                }

                var q = keepQuery(param);
                q = (q==='')?q:'?'+q;

                var sub = current.indexOf('?');
                var url2 =  (sub>0)?current.substring(0,sub):current;

                window.location.href = url2+q;
            };

        var enterPrice = function(t,e,mode){
            var keycode = (e.keyCode ? e.keyCode : e.which);
            if (keycode != '13' && mode == 'input') {
               return false;
            }

            var p = $(t).closest('.box-search-price'),
            min = parseInt(p.find('input[name=min_price]').val()),
            max = parseInt(p.find('input[name=max_price]').val());

            if(isNaN(min) && isNaN(max)){
                alert('กรุณากรอกตัวเลข');
                return false;
            }else if(min > max){
                alert('min ต้องน้อยกว่า max');
                return false;

            }

            min = (min === '')?0:min;
            max = (max === '')?50:max;

            min = (isNaN(min))?'':min;
            max = (isNaN(max))?'':max;

            var param = getUrlVars();
            param.min_price = min;
            param.max_price = max;

            var q = keepQuery(param);

            var url =  document.URL.substring(0,document.URL.indexOf('?'));
            window.location.href = url+"?"+q;
        };

        return new Main();
    };

    Portal.prototype.location = function(pathname) {
        var Main = function(){
                this._search = {};
                this._location = w.location;
            },
            that = this;

        Main.prototype.getPath = function(){

        };

        Main.prototype.getSearch = function(){
            if ( !this._location.search && _.indexOf( this._location.search, '?' ) == -1) return;

            var temp = this._location.search
                .slice(1)
                .split('&');

            this._search = _.reduce( temp, function(result, value){
                    var temp = value.split('=');
                    result[temp[0]] = temp[1];
                    return result;
                },{}
            );

            return  this._search;
        };

        Main.prototype.toString = function(){

            var resetPage = false,
                queryString = _.reduce(this._search, function(result, value, key){
                    result.push( key + '=' + value );
                    return result;
                },[]);

            return queryString.length ? '?' + queryString.join('&') : '';
        };

        Main.prototype.search = function(key, value, extend, resetPage){
            var queryString;

            extend = extend || false;
            resetPage = resetPage || false;

            if ( _.isString(key) && _.isString(value) ) {
                if (extend) {
                    this.getSearch();
                    this._search[key] = value;
                }
                else {
                    //clear all query string when not extend mode
                    this._search = {};
                    this._search[key] = value;
                }
            } else if ( _.isObject( key ) ) {
                this.getSearch();
                if( value )
                    _.merge(this._search, key);
                else
                    this._search = key;
            } else if ( _.isString(key) && _.isNull(value) ) {
                if ( this._search[key] )
                    delete this._search[key];
            } else {
                return false;
            }

            if ( resetPage && this._search.p ) {
                delete this._search.p;
            }

            queryString = this.toString();
            pathname = pathname ? '/' + pathname : w.location.pathname;
            pathname = pathname.replace(/\/\//g,'/');
            //pathname = w.location.pathname;

            ga('send', 'event', 'Button', 'Click', 'Search');

            this.redirectTo( (pathname || w.location.pathname) + queryString );
        };

        Main.prototype._checkScope = function(path){
            var current = w.getPathType(w.location.href);
                next = w.getPathType(path);

            return {
                hasChange : current != next,
                current : current,
                next : next
            };
        };

        Main.prototype.redirectTo = function(path){
            if ( w.isPushState) {
                var scope = this._checkScope(path);
                if ( scope.hasChange ) {
                    w.location.href = w.location.origin + ( path || pathname || '' );
                } else {
                    w.portalPushState.loadPage(path, scope.next);
                }
            }
            else
                w.location.href = w.location.origin + ( path || pathname || '' );
        };

        return new Main();
    };

    Portal.prototype.statRunner = function(){
        var $transaction = $('#stat_transaction'),
            $product = $('#stat_product'),
            $member = $('#stat_member'),
            onDone = function(response){
                $transaction.text(response.sales);
                $product.text(response.products);
                $member.text(response.members);
            },
            onFail = function(){
                console.log('Error');
            },
            requestParams = {
                url : '/rest/stat.json',
                method : 'GET',
                dataType : 'JSON'
            };

        $.ajax(requestParams)
        .done(onDone)
        .fail(onFail);
    };

    Portal.prototype.main = function() {
        var location       = new portal.location('search'),
            $scrolltop     = $('#scrolltop'),
            $btn_subscript = $('#btn-subscript'),
            $doc           = $('html, body'),
            $w             = $(w);

        // $doc.on('click', 'a[href="#"]', function(e){
        //     e.preventDefault();
        // });

        // if ( $w.scrollTop() >= 100 ) {
        //     $scrolltop.show();
        //     $btn_subscript.show();
        // } else {
        //     $scrolltop.hide();
        //     $btn_subscript.hide();
        // }

        $('.subscribe-btn').click(function() {

            var email = $("#email").val();
            var gender = $('input[name=gender]:checked').val();
            var myInterestArray = [];

            if (email === "") {
                alert( "ขออภัยค่ะ กรุณากรอกข้อมูลอีเมล์" );
                $("#email").focus();
                return false;
            }

            if ($("input:radio[name='gender']").is(":checked") === false) {
                alert( "ขออภัยค่ะ กรุณาระบุข้อมูลเพศ" );
                $("#gender").focus();
                return false;
            }

            if ($('.interest').is(':checked') === false) {
                alert( "ขออภัยค่ะ กรุณาระบุความสนใจ" );
                $(".interest").focus();
                return false;
            }


            $( ".interest").prop( "checked", function(k, v) {
                if (v !== false) {
                    var id = this.id;
                    myInterestArray.push(id);
                }
            });

            $.post( "/subscribe/index", { email: email, interest: myInterestArray,gender:gender })
            .done(function( data ) {
                if(data) {
                    $('.modal-body').empty().append('<p>สมัครรับข่าวสารเรียบร้อยแล้ว<br>ขอบคุณที่ท่านสนใจสมัครรับข่าวสารกับเรา</p>');
                }
            }).fail(function() {
                alert( "ขออภัยค่ะ ระบบขัดข้องกรุณาลองอีกครั้ง" );
            });
        });


        //Top navigation
        $('.box-btn-category').mouseleave(function(){
                var $this = $(this);
                if ( $this.hasClass('open') )
                    $this.click();
            })
            .click(function(e){
                var $this = $(this);

                if ( $this.hasClass('open') ) {
                    $this.removeClass('open')
                        .find('.icon-chevron-up')
                        .removeClass('icon-chevron-up')
                        .addClass('icon-chevron-down');
                } else {
                    $this.addClass('open')
                        .find('.icon-chevron-down')
                        .removeClass('icon-chevron-down')
                        .addClass('icon-chevron-up');
                }
            });

        //Search
        var getSuggestion = function () {
                if ( xhr )
                    xhr.abort();

                xhr = $.getJSON('/rest/suggestion.json', {
                        q : $input.val()
                    })
                    .done(function(response){
                        $suggestion.empty();

                        if ( response && response.length ) {
                            $suggestion.append( template({ data : response }) )
                                .removeClass('hide');

                            // $(w).unbind('click', closeSuggestion)
                            // .bind('click', closeSuggestion);
                        } else {
                            $suggestion.addClass('hide');
                        }
                    })
                    .fail(function(response){

                    });
            },
            template = _.template('<% _.forEach(data, function(val) { %><li><a><%- val.name %></a></li><% }); %>'),
            $search = $('.box-group-search'),
            $suggestion = $search.find('.search-suggestion'),
            $input  = $search.find('input'),
            delayGet,
            xhr;

        $input.on('click',function(){
            if ( $suggestion.children().length && $suggestion.hasClass('hide') ) {
                $suggestion.removeClass('hide');
            }
        });

        $search.mouseleave(function(){
            $suggestion.addClass('hide');
        });
        // $search.mouseenter(function(){
        //     if ( $suggestion.children().length && $suggestion.hasClass('hide') ) {
        //         $suggestion.removeClass('hide');
        //     }
        // });

        $search.on('click', 'li', function(){
            $suggestion.addClass('hide');
        });
            // .blur(function(e){
            //     var target = e.target || e.srcElement;
            //     if ( !$(target).closest('.box-group-search').length && !$suggestion.hasClass('hide') ) {
            //         $suggestion.addClass('hide');
            //     }
            // });

        $input.on('keypress', function(e) {
            var keycode = (e.keyCode ? e.keyCode : e.which);

            if (keycode == 13) {
                $suggestion.find('li.active').click();
                $search.find('button').click();
                e.preventDefault();
                e.stopPropagation();
            }

            if (delayGet)
                w.clearTimeout(delayGet);

            delayGet = setTimeout(getSuggestion, 60);
        });

        $input.on('keyup',function(e){
            var current,
                target,
                keycode = (e.keyCode ? e.keyCode : e.which);

            switch (keycode) {
                case 38:
                    $current = $suggestion.find('li.active').length ? $suggestion.find('li.active').removeClass('active'): [];
                    $target = $current.length ? $current.prev(): $suggestion.find('li:last-child');

                    if ( !$target.length )
                        $target = $suggestion.find('li:last-child');

                    $target.addClass('active');
                break;
                case 40:
                    $current = $suggestion.find('li.active').length ? $suggestion.find('li.active').removeClass('active'): [];
                    $target = $current.length ? $current.next(): $suggestion.find('li:first-child');

                    if ( !$target.length )
                        $target = $suggestion.find('li:first-child');

                    $target.addClass('active');
                break;
            }

            if ( _([13,38,40]).indexOf(keycode) !== -1 ) return;

            if (delayGet)
                w.clearTimeout(delayGet);

            delayGet = setTimeout(getSuggestion, 60);
        });

        $search.find('.search-suggestion')
            .on('click', 'li', function(){
                var text = $(this).text();
                $input.val( text );
                location.search({
                    q : text
                });
            });

        $search.on('mouseenter click', '.box-search-type', function(){
            var $this = $(this);
            if ( $this.hasClass('open') ) {
                $this.removeClass('open');
            } else {
                $this.addClass('open');
            }
        });


        $search.find('.box-search-type')
            .mouseleave(function(){
                $(this).removeClass('open');
            });

        $search.on('click', '.box-search-type > li', function(){

            var $this   = $(this),
                $clone  = $this.clone(),
                $parent = $this.parent();

                if ( $this.hasClass('active') ) {
                    $parent.removeClass('open');
                    return;
                }

            $this.remove();
            $clone.prependTo($parent);
            $clone.addClass('active')
                .siblings()
                .removeClass('active');

            setTimeout(function(){
                $clone.parent().removeClass('open');
            },0);
            // $parent.removeClass('open');
        });

        var loc = new portal.location('search');
        // var p   = loc.getSearch();

        $search.on('click', 'button', function(){
            if ( $search.find('.box-search-type li.active').data('stype') == 'store' ) {
                loc.search({
                    q : $input.val(),
                    f : 'shop:1',
                    ref_c : 'box'
                });
            } else {
                loc.search({
                    q : $input.val(),
                    ref_c : 'box'
                });
            }
        });

        //Scroll to top btn
        var updatePosition = function(){
            if ( $(this).scrollTop() >= 600 ) {
                if ( $scrolltop.is(':hidden') ) {
                    $scrolltop.fadeIn();
                    $btn_subscript.fadeIn();
                }
            } else {
                if ( $scrolltop.is(':visible') ) {
                    $scrolltop.fadeOut();
                    $btn_subscript.fadeOut();
                }
            }
        };

        var throttled = _.throttle(updatePosition, 500);

        $w.on('scroll', throttled);

        $scrolltop.click(function(){
            $doc.animate({ scrollTop: '0px' });
        });

        _.defer(function() {
            $w.scroll();
        });
    };

    Portal.prototype.focusItemById = function() {
        //get location href instance
        var loc = new portal.location();
        //get current query string
        var params = loc.getSearch();
        //if item is undefined, null, 0, NaN. return;
        if ( !params || !params.pid ) return;

        var listOfProduct = $('#pushstate-content li a.item-name');
        //if no target return;
        if (!listOfProduct.length) return;

        var focusedItem = false;
        var found = _(listOfProduct).find(function(li) {
            return li.getAttribute('href').indexOf(params.pid) !== -1;
        });
        if (found) {
            //get last focus item in cookie
            focusedItem = $.cookie('focusItem');
            //if focusedItem is undefined
            if (!focusedItem)
                focusedItem = [];
            else
                focusedItem = focusedItem.split(',');

            $(found).closest('li').addClass('active');

            if (focusedItem.indexOf(params.pid) === -1) {
                $(found)
                    .velocity('scroll', { delay: 300, duration: 600, offset: -50 })
                    .velocity('callout.shake', { delay: 300 });

                //put new item to focused collection
                focusedItem.push(params.pid);

                //update cookie
                $.cookie('focusItem', focusedItem, { expires: 0.05 });
            }
        }

    };

    Portal.prototype.polyfill = function(){
        var $placeholder = $('input.input-top-search[placeholder]'),
            $container = $('.box-group-search'),
            placeholderText = $placeholder.attr('placeholder'),
            onFocus = function(e){
                if ( this.value === placeholderText )
                    this.value = '';
            },
            onBlur = function(){
                if ( this.value === '' )
                    this.value = placeholderText;
            },
            onClick = function(){
                if ( $placeholder[0].value ==  placeholderText )
                    $placeholder[0].value = '';
            };

        $container.on('click', 'button', onClick);

        $placeholder.removeAttr('placeholder')
            .val( $placeholder.val() || placeholderText )
            .on('focus', onFocus)
            .on('blur', onBlur);
    };

    Portal.prototype.pushState = function(){
        var pushState = function(){
            var that = this;
            that.ID_CONTENT_CONTAINER = '#pushstate-content-container';
            that.ID_CONTENT           = '#pushstate-content';
            that.ID_PAGINATION        = '#pushstate-pagination';
            that.ID_FILTER            = '#pushstate-filter-tool';
            that.ID_TITLE             = '#pushstate-title';
            that.ID_BREADCRUMB        = '#pushstate-breadcrumb';
            that.$main                = $( that.ID_CONTENT_CONTAINER );
            that.$breadcrumb          = $( that.ID_BREADCRUMB );
            that.$pagination          = $( that.ID_PAGINATION );
            that.$filter              = $( that.ID_FILTER );
            that.$title               = $( that.ID_TITLE );

            var onClick = function(e){
                e.preventDefault();

                var href = $(this).attr('href'),
                    type = w.getPathType( href );

                that.loadPage(href, type);
            };



            that.$pagination.on('click', 'a', onClick);

            w.onpopstate = function(event) {
                //first match is category view by product
                //second match is category view by shop
                //last match is search
                var type = w.getPathType();

                if (w.fromPushState && type) {
                    that.loadPage( w.location.href, type, true);
                }
            };
        };

        pushState.prototype.loadPage = function(href, type, popstate){
            var paths = w.location.pathname.split('-'),
                temp = '',
                that = this,
                url,
                title,
                addSearch = function(){
                    var s = new w.portal.location();
                    s.getSearch();
                    if (type == 'category/shop') {
                        s._search.slug = _.last(paths);
                    }
                    else {
                        s._search.slug = paths[1];
                    }
                    title = s._search.slug;
                    return s.toString();
                };


            if ( paths.length > 0 ) {
                w.fromPushState = true;

                if ( !popstate )
                    history.pushState({}, '', href);

                //TODO assign  title
                switch (type) {
                    case 'category' :
                        url = w.location.origin + '/rest/category' + paths[0] + '.txt' + addSearch();//w.location.search;
                    break;
                    case 'category/shop' :
                        if (paths[1])
                            temp = paths[1].replace('category/','');

                        url = w.location.origin + '/rest/category/shop/' + temp + '.txt' + addSearch();//w.location.search;
                    break;
                    case 'search':
                        url = w.location.origin + '/rest/search.txt' + w.location.search;
                        // title = w.location.search
                    break;
                    case 'search/shop':
                        url = w.location.origin + '/rest/search' + paths[0] + '.txt' + addSearch();
                    break;
                }

                // console.log('pushstate type = ', type);
                // console.log('url = ', url);

                this.$main.load(url + ' ' + this.ID_CONTENT , function(html){
                    var $html = $(html),
                        $doc  = $('html, body');

                    $doc.animate({scrollTop: '0px'});
                    //update class use when switch view between list and grid
                    that.$main.attr('class', $html.find( that.ID_CONTENT_CONTAINER ).attr('class') );

                    if ( type == 'search') {
                        document.title = $html.find('#search-keyword').text() + ' - Weloveshopping';
                        var $breadcrumb = $html.find( that.ID_BREADCRUMB );
                        if ( $breadcrumb.length )
                            that.$breadcrumb.show().html( $html.find( that.ID_BREADCRUMB ).children() );
                        else
                            that.$breadcrumb.hide();
                    }

                    //update new pagination
                    var $pagination = $html.find( that.ID_PAGINATION );
                    if ( $pagination.length )
                        that.$pagination.show().html( $html.find( that.ID_PAGINATION ).children() );
                    else
                        that.$pagination.hide();

                    //update new filter
                    var $filter = $html.find(that.ID_FILTER);
                    if ( $filter.length )
                        that.$filter.show().html( $html.find( that.ID_FILTER ).children() );
                    else
                        that.$filter.hide();

                    //update new title
                    var $title = $html.find( that.ID_TITLE );
                    if ( $title.length )
                        that.$title.show().html( $html.find( that.ID_TITLE ).children() );
                    else
                        that.$title.hide();

                    //Register new img.lazy-load DOM
                    // var $lazy = $( that.ID_CONTENT ).find('.lazy-load');
                    // if ( $lazy.length ) {
                    //     w.lazyLoad.register( $(that.ID_CONTENT).find('.lazy-load') );
                    // }

                    //trigger product extension
                    portal.productExtension();
                });
            }
        };


        return new pushState();
    };

    w.portal = new Portal();
    w.portal.polyfill();
    // w.lazyLoad = w.portal.lazyLoad();
    w.cart = w.portal.cart();
    w.portal.main();
    w.cart.flush();
    w.isPushState = false;
    w.fromPushState = false;
    w.portal.focusItemById();

    //enable pushstate mode
    if ($('html').hasClass('html5') && $('#content-container').hasClass('push-state')) {
        w.isPushState = true;
        w.portalPushState = w.portal.pushState();
    }

})( window, jQuery );
