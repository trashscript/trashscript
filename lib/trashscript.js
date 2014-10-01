Zepto(function($) {
    var trash = {
        css: '@hover.min.css@',
        clampSetPos: function(img, x, y) {
            img = $(img);
            if (img.height() + y > window.innerHeight) {
                y = (window.innerHeight) - img.height();
            }
            if (img.width() + x > window.innerWidth) {
                x = (window.innerWidth) - img.width();
            }

            $(img).css("left", (x+20) + 'px');
            $(img).css("top", (y+10) + 'px');
        },
        mod: {
            'hover': {
                img_html: "<img id='image-hover' alt=''/>",
                video_html: "<video id='image-hover' alt='' loop/>",
                loading: false,
                target: null,
                node: null,
                hooks: {
                    document_click: function(e) { // remove on thumbnail click only if it's our image, though.
                        var self = e.data;
                        if (this === self.img) {
                            self.removeHover(e);
                        }
                    },
                    document_mouseenter: function(e) {
                        var self = e.data;

                        if ($(this).parent().length !== 0 && $(this).parent().attr("data-expanded") === "true") {
                        	return;
                        }
                        if (self.node !== null) {
                            self.removeHover({data: self});
                        }
                        /* if (this.loading) {         // if loading, cancel load and do new image!
                         $(self.node).off("load");
                         } */

                        $(this).one({"mouseleave": self.removeHover, "click": self.removeHover}, '', self);

                        $(document).on("mousemove", function(e) {
                            trash.clampSetPos(self.node, e.clientX, e.clientY);
                        });

                        self.target = this; // store image we are hovering

                        // todo: store hover in dom object and remove later?

                        var url = $(self.target).parent().attr("href");
                        var match = /v=([^&]+)/i.exec(url);

                        if (match !== null) {
                            self.node = $(self.video_html).get(0);
                            $(self.node).attr("src", match[1]); // set video source

                            $(document.body).append(self.node);
                            $(self.node).attr("autoplay", "");
                            trash.clampSetPos(self.node, e.clientX, e.clientY); // set initial pos

                            return;
                        } else {
                            self.node = $(self.img_html).get(0);
                            $(self.node).attr("src", url); // set image source
                        }

                        $(document.body).append(self.node);
                        trash.clampSetPos(self.node, e.clientX, e.clientY); // set initial pos
                    }
                },

                removeHover: function(e) {
                    var self = e.data;
                    if (self.node == null) { return; }

                    if (self.node instanceof HTMLVideoElement) {
                        self.node.pause();
                    }
                    self.node.remove();
                    delete(self.node);
                    self.target = null;
                    self.node = null;
                    $(document).off("mousemove");
                },

                init: function(self) {
                    $(document).on("click", ".post-image", self, self.hooks.document_click);
                    $(document).on("mouseenter", ".post-image", self, self.hooks.document_mouseenter);
                    $(document.head).append("<style type='text/css'>" + trash.css + "</style>");
                },

                uninit: function(self) {
                    $(document).off("click", self.hooks.document_click);
                    $(document).off("mouseenter", self.hooks.document_mouseenter);
                    self.removeHover({data: self});
                }
            }
        }
    };

    if (bag === null) {
        $(document.body).append("<h1>[trash] Cannot load settings.</h1>");
        return;
    }

    for (var key in trash.mod) { // todo: iterate over configured modules instead.
        trash.mod[key].init(trash.mod[key]);
    }

    $(document).on('unload', function() {
    	for (var key in trash.mod) { // todo: iterate over configured modules instead.
        	trash.mod[key].uninit(trash.mod[key]);
    	}
    })

    window.trash = trash;
});