$(function () {

  var App = {};

  App.Router = Backbone.Router.extend({

    routes: {
      'test': 'showSlide'
    },

    showSlide: function () {
      var collection = new App.Slides([
        {heading: "Slide 1", content: "hello"},
        {heading: "Slide 2", content: "hello"}
      ]);
      var view = new App.SlidesView({collection: collection});
      $('#application-container').html(view.render().el);
    }
  });

  App.Slide = Backbone.Model.extend({
  });

  App.Slides = Backbone.Collection.extend({
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
      this.currentSlide = this.collection.models[index];
    },

    render: function () {
      var slideView = new App.SlideView({model: this.currentSlide});
      this.$el.html(slideView.render().el);
      this.currentSlideView = slideView;
      return this;
    },

    slideIndex: function () {
      return this.collection.indexOf(this.currentSlide);
    },

    moveSlide: function (e) {
      var newView;
      var index = this.slideIndex();
      if (e.keyCode === this.arrows.right && index < this.collection.length) {

        newSlide = this.collection.at(index + 1);
      } else if (e.keyCode === this.arrows.left && index > 0) {
        newSlide = this.collection.at(index - 1);
      }
      if (newSlide) {
        this.replaceSlide(newSlide);
      }
    },

    replaceSlide: function (newSlide) {
      this.currentSlide = newSlide;
      this.currentSlideView.remove();
      this.render();
    }
  });

  var app = {
    models: {},
    views: {},
    controllers: {},
    init: function () {
      new App.Router;
      Backbone.history.start();
    }
  };

  app.init();


});