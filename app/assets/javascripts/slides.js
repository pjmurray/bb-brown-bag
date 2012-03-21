$(function () {

  var App = {};

  App.Router = Backbone.Router.extend({

    routes: {
      '': 'bootstrap',
      ':id': 'showSlide'
    },


    bootstrap: function (index) {
      var collection = new App.Slides([
      ]);
      this.view = new App.SlidesView({collection: collection, slide: index});
      $('#application-container').html(this.view.el);
    },

    showSlide: function (index) {
      if (this.view === undefined) {
        this.bootstrap();
      } else {
        this.view.showSlide(index);
        this.navigate('' + index);
      }
    }


  });

  App.Slide = Backbone.Model.extend({
    url: '/slides'
  });

  App.Slides = Backbone.Collection.extend({
    url: '/slides',
    model: App.Slide

  });

  App.SlideView = Backbone.View.extend({

    className: 'slide',

    render: function () {
      this.$el.html(this.template());
      return this;
    },

    template: function () {
      return _.template("<h1><%= heading %></h1><div class='content'><%= content %></div>", this.model.toJSON());
    }

  });

  App.SlidesView = Backbone.View.extend({

    events: {},

    arrows: {
      left: 37,
      right: 39
    },

    initialize: function () {
      _.bindAll(this, 'moveSlide');
      document.onkeydown = this.moveSlide;
      var index = 0;
      if (this.options.slide) {
        index = this.options.slide;
      }
      var that = this;
      this.collection.fetch({success: function () {
        that.showSlide(index);
      }})
    },

    render: function () {
      return this;
    },

    showSlide: function (index) {
      this.currentSlide = this.collection.at(index);
      if (this.currentSlide === undefined) {
        throw "no slide exists for index: " + index
      }
      if (this.currentSlideView) {
        this.currentSlideView.remove();
      }
      var slideView = new App.SlideView({model: this.currentSlide});
      this.$el.html(slideView.render().el);
      this.currentSlideView = slideView;

    },

    slideIndex: function () {
      return this.collection.indexOf(this.currentSlide);
    },

    moveSlide: function (e) {
      var index = this.slideIndex();
      var newIndex;
      if (e.keyCode === this.arrows.right && index < this.collection.length) {

        newIndex = (index + 1);
      } else if (e.keyCode === this.arrows.left && index > 0) {
        newIndex = (index - 1);
      }
      if (newIndex) {
        router.showSlide(newIndex);
      }
    }
  });

  var router = new App.Router;
  Backbone.history.start();

});