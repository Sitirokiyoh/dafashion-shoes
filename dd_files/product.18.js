;(function(w, $, ng){
    var PRODUCT_ID = w.PRODUCT_ID,
        STORE_ID = w.STORE_ID,
        IS_WETRUST = w.isShowWetrust,
        IS_OLD_STORE = w.IS_OLD_STORE,
        HOW_TO_ACTIVE_TAB,
        INVENTORY_TYPE = w.inventoryType,
        INVENTORY = w.inventoryData,
        productTitle,
        categoryTitle;

    Number.prototype.formatMoney = function(c, d, t) {
        var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    ng.module('productDetail', [])
        .config([
            '$interpolateProvider',
            '$httpProvider',
            function($interpolateProvider, $httpProvider){
                // console.log('11')
                $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
                $httpProvider.defaults.cache = true;
            }
        ])
        .factory('optionModel', [
            '$rootScope',
            function($rootScope) {
                var validOption = INVENTORY;
                var selectedOption = {};
                return {
                    get : function() {
                        if (!IS_OLD_STORE && _.size( validOption ) == 1) {
                            selectedOption = _.first( _.pluck( validOption ) );
                        }
                        return selectedOption;
                    },
                    setItem : function (option) {
                        var found = _.find( validOption, option );
                        selectedOption = found;

                        $rootScope.$broadcast('update-sku', selectedOption.sku);
                        $rootScope.$broadcast('update-compare-price', selectedOption.compare_price);
                        $rootScope.$broadcast('update-price', selectedOption.price);

                        return found;
                    },
                    inStock : function(option) {
                        var found = _.find( validOption, option );
                        if (found) {
                            return found.stock > 0;
                        }
                        return false;
                    },
                    find : function(option) {
                        return _.find( validOption, option );
                    },
                    updateStock : function(option, expectStock) {
                        var target = validOption[ option.id ];
                        if (target) {
                            validOption[ option.id ].stock = (target.stock >= expectStock)? target.stock - expectStock: 0;

                            if (validOption[ option.id ].stock === 0) {
                                validOption[ option.id ].allow_addcart = false;
                            }

                            if (selectedOption.id == option.id) {
                                selectedOption = validOption[ option.id ];
                            }

                            return validOption[ option.id ].stock;
                        }
                    }
                };
            }
        ])
        .directive('scrollTo', [
            '$document',
            function($document) {
                return {
                    link : function($scope, $element, $attrs) {
                        $target = $( $attrs.scrollTo );
                        if ( $target.length ) {
                            $element.click(function() {
                                $target
                                    .click()
                                    .velocity('scroll');
                            });
                        }
                    }
                }
            }
        ])
        .directive('relatedProduct', [
            function() {
                return {
                    restrict : 'A',
                    link : function($scope, $element, $attrs) {
                        var $container = $element.find('.box-items-list');
                        var $scollContainer = $container.find('#scroll-container');
                        var $li = $container.find('li');
                        // var $container = $element.find('.related-product');
                        var page = 0;
                        var itemPerPage = 5;
                        var range = _.range(0, $li.length, 5);
                        var totalPage = range.length;
                        // var newWidth = $container.width() * totalPage;

                        w.portal.productExtension();

                        //get first of item on every page
                        var headItem = _.map(range, function(v, k){
                                    return $li.eq(v);
                                });


                        var compileImgSrc = function() {
                            var imgSrc = $container.find('[img-src]');
                            // imgSrc = imgSrc.slice(0, 5);
                            _.forEach(imgSrc, function(v, k) {
                                var $v = $(v),
                                    $el = $('<img style="width:100%;" src="' + $v.attr('img-src') + '">');

                                $v.after( $el );
                                $v.remove();
                            });
                        };

                        if ( totalPage > 1 ) {
                            $scope.hasNext = true;
                            $scope.hasPrev = true;

                            $element
                                .find('.arrow-item-left')
                                .on('click', function() {
                                    var targetPage = (page - 1 < 0)? totalPage - 1: page - 1;
                                    page = targetPage;

                                    var $target = headItem[ targetPage ];

                                    $target.velocity("scroll", {
                                            container:  $scollContainer,
                                            axis: 'x'
                                        });
                                })
                                .end()
                                .find('.arrow-item-right')
                                .on('click', function() {
                                    var targetPage = (page + 1 > totalPage - 1)? 0: page + 1;
                                    page = targetPage;

                                    var $target = headItem[ targetPage ];

                                    $target.velocity("scroll", {
                                            container:  $scollContainer,
                                            axis: 'x'
                                        });
                                });
                        }

                        _.defer(compileImgSrc);
                    }
                };
            }
        ])
        .directive('ngSku', [
            function() {
                return {
                    restrict : 'A',
                    link : function($scope, $element, $attrs) {
                        $scope.$on('update-sku', function(e, sku) {
                            $element.text( 'รหัสสินค้า : ' + sku );
                        });
                    }
                };
            }
        ])
        .directive('ngComparePrice', [
            function() {
                return {
                    restrict : 'A',
                    link : function($scope, $element, $attrs) {
                        $scope.$on('update-compare-price', function(e, price) {
                            if (price <= 0) {
                                $element.hide();
                            } else {
                                if ($element.is(':hidden')) $element.show();

                                price = price.formatMoney(2).replace('.00','');
                                $element.text('จากราคาปกติ ' + price + ' บาท');
                            }
                        });
                    }
                };
            }
        ])
        .directive('ngPrice', [
            function() {
                return {
                    restrict : 'A',
                    link : function($scope, $element, $attrs) {
                        $scope.$on('update-price', function(e, price) {
                            price = price.formatMoney(2).replace('.00','');
                            $element.text( price + ' บาท' );
                        });
                    }
                };
            }
        ])
        .directive('ngPriceSelector', [
            'optionModel',
            function(optionModel) {
                return {
                    restrict : 'A',
                    link : function($scope, $element) {
                        $scope.targetQuantity = 1;

                        $scope.$on('reset-quantity', function() {
                            $scope.targetQuantity = 1;
                            $scope.$apply('targetQuantity');
                        });

                        $element.find('#product_quantity_decrease')
                            .click(function() {
                                if ($scope.targetQuantity == 1) {
                                    return alert('คุณเลือกจำนวนต่ำสุด');
                                }

                                $scope.targetQuantity = $scope.targetQuantity - 1;
                                $scope.$apply('targetQuantity');
                            });

                        $element.find('#product_quantity_input')
                            .blur(function() {
                                if (!$.isNumeric($scope.targetQuantity)) {
                                    alert('จำนวนต้องเป็นตัวเลขเท่านั้น');
                                    $scope.targetQuantity = 1;
                                    $scope.$apply('targetQuantity');
                                    return false;
                                }


                                if ($scope.targetQuantity < 1) {
                                    alert('คุณเลือกจำนวนต่ำสุด');
                                    $scope.targetQuantity = 1;
                                    $scope.$apply('targetQuantity');
                                }

                                if (INVENTORY) {
                                    var current = optionModel.get();

                                    if (current.stock >= 0) {
                                        if (current.ignore_stock === false && $scope.targetQuantity > current.stock) {
                                            alert('จำนวนสูงสุดที่สามารถเลือกได้คือ ' + current.stock);

                                            $scope.targetQuantity = current.stock;
                                            $scope.$apply('targetQuantity');
                                        }
                                    } else {
                                        alert('กรุณาเลือกสี');

                                        $scope.targetQuantity = 1;
                                        $scope.$apply('targetQuantity');
                                    }
                                }
                            });

                        $element.find('#product_quantity_increase')
                            .click(function() {
                                if (INVENTORY) {
                                    var current = optionModel.get();
                                    if (current.stock >= 0) {
                                        if (current.ignore_stock === true || current.stock >= $scope.targetQuantity + 1) {
                                            $scope.targetQuantity = parseInt($scope.targetQuantity) + 1;
                                            $scope.$apply('targetQuantity');
                                        } else {
                                            alert('คุณเลือกจำนวนสูงสุด');
                                        }
                                    } else {
                                        alert('กรุณาเลือกสี');
                                    }
                                } else {
                                    $scope.targetQuantity = parseInt($scope.targetQuantity) + 1;
                                    $scope.$apply('targetQuantity');
                                }
                            });
                    }
                };
            }
        ])
        .directive('optionSelector', [
            'optionModel',
            '$rootScope',
            function(optionModel, $rootScope) {
                return {
                    restrict : 'A',
                    link : function($scope, $element, $attrs) {
                        var optionValue = {};
                        optionValue[$attrs.optionSelector] = $attrs.optionTitle;

                        var clickHandler = function() {
                            if ($element.hasClass('disable')) {
                                var currentSelectOption = optionModel.find(optionValue);
                                if (currentSelectOption.cart_text) {
                                    $rootScope.$broadcast('disable-add-to-cart', currentSelectOption.cart_text);
                                }
                            } else {
                                if (!$element.hasClass('selected')) {
                                    $rootScope.$broadcast('reset-quantity');
                                }

                                $element.addClass('selected')
                                    .siblings()
                                    .removeClass('selected');

                                optionModel.setItem(optionValue);

                                $rootScope.$broadcast('enable-add-to-cart');
                            }
                        };

                        $element.click(clickHandler);

                        //check stock
                        if (optionValue.ignore_stock === false && !optionModel.inStock(optionValue) ) {
                            $element.addClass('disable');
                        }
                    }
                };
            }
        ])
        .directive('cartText', [
            function() {
                return {
                    restrict: 'A',
                    link : function($scope, $element) {
                        $element.hide();

                        $scope.$on('enable-add-to-cart', function() {
                            $element.hide();
                        });

                        $scope.$on('disable-add-to-cart', function(e, txt) {
                            $element.text(txt).show();
                        });
                    }
                };
            }
        ])
        .directive('buyProduct', [
            'optionModel',
            '$timeout',
            '$rootScope',
            function(optionModel, $timeout, $rootScope) {
                var flyToCart = function(){
                    $('body').animate({scrollTop:0}, function(){
                        var quantity = $('.input-option-num').val();
                        var cart = $('.box-cart');
                        var imgtodrag = $('.product-img-l img:visible');
                        var imgclone = imgtodrag.clone()
                                .offset({
                                    top: imgtodrag.offset().top,
                                    left: imgtodrag.offset().left
                                }).css({
                                    'opacity': '0.5',
                                    'position': 'absolute',
                                    'height': '150px',
                                    'width': '150px',
                                    'z-index': '100'
                                })
                                .appendTo($('body'))
                                .animate({
                                    'top': cart.offset().top + 15,
                                    'left': cart.offset().left + 25,
                                    'width': 75,
                                    'height': 75
                                }, 1000, function(){
                                    imgclone.animate({
                                        'width': 0,
                                        'height': 0
                                    }, function () {
                                        $(this).detach();
                                        // w.cart.add(parseInt(quantity));
                                    });
                                });
                    });
                };

                return {
                    restrict : 'A',
                    controller : function($scope, $element) {
                        $scope.validateOption = function(){
                            if (!INVENTORY) return true;

                            var targetItem = optionModel.get();
                            if ( _.isEmpty(targetItem)) {
                                alert('กรุณาเลือกสี');
                                return false;
                            }

                            if (targetItem.ignore_stock === true) {
                                return true;
                            }

                            var expectStock = $scope.$targetQuantityInput.val();
                            if ( targetItem.stock >= expectStock ) {
                                return true;
                            }
                            return false;
                        };
                    },
                    link : function($scope, $element, $attrs) {
                        $scope.$targetQuantityInput = $('#product_quantity_input');

                        $scope.$on('disable-add-to-cart', function(e, text) {
                            $element.hide();
                        });

                        $scope.$on('enable-add-to-cart', function(e) {
                            $element.show();
                        });



                        $scope.$on('check-currect-stock', function() {
                            //check new store
                            if (!IS_OLD_STORE && _.size( inventoryData ) == 1) {
                                var targetInventory = optionModel.get();
                                if (targetInventory.allow_addcart === false) {
                                    $rootScope.$broadcast('disable-add-to-cart', targetInventory.cart_text);
                                }
                            }
                        });

                        $timeout(function() {
                            $scope.$broadcast('check-currect-stock');
                        });

                        $element.click(function() {
                            if ($scope.validateOption()) {
                                var targetInventory = optionModel.get();
                                // if ( !targetInventory.id && !IS_OLD_STORE ) {
                                //     targetInventory = _.first( _.pluck(inventoryData) );
                                // }
                                var quantity = parseInt( $scope.$targetQuantityInput.val() );
                                var data = {
                                    'product_id': PRODUCT_ID,
                                    'inventory_id': targetInventory.id || 0,
                                    'quantity': quantity,
                                    'store_id': STORE_ID,
                                };

                                var price = targetInventory.price || $('.product-price').data('price');
                                facebookConversionPixel(price * quantity);
                                $.post('/rest/cart', data).success(function(res) {
                                    if (res === true) {

                                        if (targetInventory.ignore_stock === true) return;

                                        var leftStock = optionModel.updateStock({id : data.inventory_id}, quantity);
                                        if (leftStock <= 0) {
                                            var $siblingsEl = $('.option-selector-item.selected').addClass('disable')
                                                    .siblings()
                                                    .not('.disable');

                                            if ( $siblingsEl.length )
                                                $siblingsEl.first().click();
                                            else
                                                $('.option-selector-item').removeClass('selected');

                                            if (_.size(INVENTORY) == 1) {
                                                $rootScope.$broadcast('disable-add-to-cart', 'สินค้าหมด');
                                            }
                                        }

                                        ga('ec:addProduct', {
                                            'id': PRODUCT_ID,
                                            'name': productTitle,
                                            'category': categoryTitle,
                                            'variant': data.inventory_id,
                                            'price': price,
                                            'quantity': quantity
                                        });
                                        ga('ec:setAction', 'add');
                                        ga('send', 'event', 'UX', 'click', 'add to cart');
                                    }
                                });

                                flyToCart();

                                $timeout(function() {
                                    ///update notification in cart
                                    w.cart.add( quantity );
                                }, 1000);
                            }
                        });
                    }
                };
            }
        ])
        .controller('base', [
            '$scope',
            function($scope) {
                if (!IS_WETRUST)
                    $('.wetrust-guarantee').remove();

                $scope.howtoActiveTab = HOW_TO_ACTIVE_TAB;
            }
        ])
        .controller('productOption', [
            '$scope',
            '$timeout',
            function($scope, $timeout) {

            }
        ])
        .controller('description', [
            function(){

            }
        ])
        .controller('payment', [
            '$scope',
            '$http',
            '$templateCache',
            function($scope, $http, $templateCache){
                var that = this;
                this.cacheKey = '/product/' + STORE_ID + '/paymentother.json';
                $http.get( that.cacheKey)
                    .success(function(data){
                        $templateCache.put(that.cacheKey, data);
                        $scope.paymentOtherUrl = that.cacheKey;
                    });

                $http.get( '/product/' + STORE_ID + '/payment.json')
                    .success(function(data) {
                        if ( data.data &&
                            data.data.payment &&
                            data.data.payment.payment_channel &&
                            IS_WETRUST)
                        {

                            $scope.paymentChannel = data.data.payment.payment_channel;
                            $scope.payWithCreditCard = data.data.payment.payment_channel.credit === true;
                            $scope.payWithAtm = data.data.payment.payment_channel.atm === true;
                            $scope.payWithIbank = data.data.payment.payment_channel.ibank === true;
                            $scope.payWithBanktrans = data.data.payment.payment_channel.banktrans === true;
                            $scope.payshop = false;

                            // if (data.data.payment.payment_channel.payshop === true) {
                            //     $scope.payshop = true;
                            // }
                        }
                        else {
                            $scope.payshop = true;
                        }
                        // $scope.payment_channel = true;
                        // $scope.payshop = true;
                    });
            }
        ])
        .controller('shipping', [
            '$scope',
            '$http',
            function($scope, $http){
                $http.get( '/product/'+PRODUCT_ID+'/shipping.json')
                    .success(function(data) {
                        $scope.shipping = data.product.shipping;
                    });
            }
        ])
        .controller('recentView', [
            '$scope',
            '$http',
            function($scope, $http) {
                $http.get( '/product/' + PRODUCT_ID + '/recentproduct.json' )
                    .success(function(data) {
                        if (data.data &&
                            data.data.length > 0)
                        {
                            $scope.isShow = true;
                            $scope.recent = data.data;
                        } else {
                            $scope.isShow = false;
                        }
                    });
            }
        ]);


    ng.element(document).ready(function() {
        //for ga use to send data
        var $breadcrumb = $('.box-breadcrumb li span');
        if ($breadcrumb.length) {
            categoryTitle = _.reduce($breadcrumb, function(result, val, key) {
                result[key] = $(val).text();
                return result;
            }, []);
        }
        //ga product title
        productTitle = $('.product-name').text();
        //ga category title with | seperated
        categoryTitle = categoryTitle.join('|');

        //Set first active tab by checking description has rendered in html.
        HOW_TO_ACTIVE_TAB = ng.element('#howto-description').length > 0 ? 'description': 'payment';
        ng.bootstrap(document, ['productDetail']);

        _.defer(function() {
            var selectorItem = $('.option-selector-item');
            if (selectorItem.length == 1)
                selectorItem.click();
        });

        $.get('/product/' + PRODUCT_ID +'/stat.json');

        $.get( '/rest/store_extension.json?id=' + STORE_ID, function( data ) {
            if(typeof data.data != 'undefined' && typeof data.data[0] != 'undefined'){
                if(data.data[0] != ''){
                    var items = data.data[0][STORE_ID].support_method;
                    for(var k in items){
                        if(items[k]){
                            $('.shop-service .'+k).show();
                            $('.seller-policy .'+k).show();
                        }
                    }
                }
            }
        });

        /// Analytic Stat ///
        $.get('/rest/haslogin.json', function( data ) {
            if(document.URL.match('/product/')){
                var prefix = '/product/' + PRODUCT_ID + (IS_WETRUST ? '/': '/n'),
                    gaType = data == 1 ? 'wt_l': 'wt_nl',
                    pageViewUrl = prefix + gaType;

                ga('require', 'ec');
                ga('ec:addProduct', {
                    'id': PRODUCT_ID,
                    'name': productTitle,
                    'category': categoryTitle
                });
                ga('ec:setAction', 'detail');
                ga('send', 'pageview', pageViewUrl);
                ga('allTraffic.send', 'pageview', pageViewUrl);
             }
        });

        $('.social-share').socialLikes({
            zeroes:'yes'
        });

        switchImg(0, $('.product-thumb-s li:first-child img'));
    });

    function facebookConversionPixel(fb_value){
        var image = new Image(1,1);
        image.src = "//www.facebook.com/offsite_event.php?id=6010843347130&amp;value=" + fb_value + "&amp;currency=THB";
        var image2 = new Image(1,1);
        image2.src = "//www.facebook.com/offsite_event.php?id=6016366915496&amp;value=" + fb_value + "&amp;currency=THB";
    }

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=1419357161612772";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    //Please call pinit.js only once per page
})(window, jQuery, angular);


function switchImg(id,e){
    var li = $(e).closest('li');
    if(li.hasClass('active') == true){
        return false;
    }
    $('.product-thumb-s li').removeClass('active');
    li.addClass('active');
    $('.product-img-l img').hide().eq(id).css('display','block');

    $('.zoomContainer').hide();
    if(li.hasClass('loaded') == true){
        $('.zoomContainer.zoom'+id).show();
        //console.log($('.zoomContainer .zoom'+id));
    }else{
        zoomImg(id);
        li.addClass('loaded')
    }
}

function zoomImg(id,li){
    var config = {
            zoomWindowWidth : 551,
            zoomWindowHeight: 551,
            zoomWindowFadeIn : 100,
            borderSize : 0,
            lensBorder:0,
            lensOpacity:0,
            lensBorderColour:'transparent',
            lensColour:'#fff',
            lensBorderSize: 0,
            zoomWindowBgColour:'transparent',
            cursor:'crosshair',
            zoomWindowOffetx:1,
            zoomWindowOffety:0,
            borderColour:'#FED09E'
        };
    $('#zoom'+id).elevateZoom(config);
}
