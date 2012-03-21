$(function () {

  var App = {};

  App.Router = Backbone.Router.extend({

    routes: {
      '': 'bootstrap',
      ':id': 'showSlide',
      ':id/edit': 'showSlideInEditMode'
    },


    bootstrap: function (index, editable) {
      index = index === undefined ? 0 : index;
      var collection = new App.Slides([
      ]);
      this.view = new App.SlidesView({
        collection: collection,
        slide: index,
        editable: editable,
        el: '#application-container'
      });
      this.view.render();
      var path = editable ? '/edit' : '';
      this.navigate('' + index + path);
    },

    showSlide: function (index, editable) {
      if (this.view === undefined) {
        this.bootstrap(index, editable);
      } else {
        this.view.setEditable(editable);
        this.view.showSlide(index);
        var path = editable ? '/edit' : '';
        this.navigate('' + index + path);
      }
    },
    showSlideInEditMode: function (index) {
      this.showSlide(index, true)
    }


  });

  App.Slide = Backbone.Model.extend({
    url: function () {
      var path = '/slides';
      if (this.id !== undefined) {
        path = path + '/' + this.id;
      }
      return path;
    }
  });

  App.Slides = Backbone.Collection.extend({
    url: '/slides',
    model: App.Slide

  });

  App.SlideView = Backbone.View.extend({

    className: 'slide',

    events: {
      'change': 'updateModel',
      'click button': 'save'
    },

    initialize: function (options) {
      this.editable = options.editable;
      _.bindAll(this, 'handleOnSave');
    },

    render: function () {
      var showHtml = this.showTemplate();
      var editHtml = this.editTemplate();
      this.$el.html(showHtml + editHtml);
      this.setEditable(this.editable);
      return this;
    },

    showTemplate: function () {
      return _.template("<div class='show-slide'><h1><%= heading %></h1><div class='content'><%= content %></div></div>", this.model.toJSON());
    },

    editTemplate: function () {
      return _.template("<div class='edit-slide'><form><input value='<%= heading %>'/><div class='content'><textarea rows='8' cols='80'><%= content %></textarea><button type='button'>Save</button></form></div>", this.model.toJSON());
    },

    updateModel: function () {
      this.model.set({heading: this.$('input').val(), content: this.$('textarea').val()});
    },

    setEditable: function (editable) {
      this.editable = (editable === true);
      this.$('.visible').removeClass('visible');
      var state = editable ? 'edit' : 'show'
      this.$('.' + state + '-slide').addClass('visible');
    },

    save: function (e) {
      e.preventDefault();
      this.model.save({}, {success: this.handleOnSave});
    },
    handleOnSave: function () {
      this.$('.show-slide').replaceWith($(this.showTemplate()));
      router.showSlide(this.model.collection.indexOf(this.model))
    }



  });

  App.SlidesView = Backbone.View.extend({

    events: {
      'click .edit': 'toggleEditable'
    },

    arrows: {
      left: 37,
      right: 39
    },


    initialize: function (options) {
      _.bindAll(this, 'moveSlide', 'turnOffEditable');
      document.onkeydown = this.moveSlide;
      var index = 0;
      if (this.options.slide) {
        index = this.options.slide;
      }
      this.editable = options.editable === true;
      var that = this;
      this.collection.fetch({success: function () {
        that.showSlide(index);
      }});

    },

    render: function () {
      this.$el.html(this.template());
      if (this.editable) {
        this.$el.addClass('editable');
      }
      return this;
    },
    template: function () {
      return _.template("<div class='edit'><p>Edit</p></div><div id='slide-container'></div>", {});
    },

    showSlide: function (index) {
      var newSlide = this.collection.at(index);
      if (this.currentSlide === newSlide && this.currentSlideView) {
        this.currentSlideView.setEditable(this.editable);
      } else {
        if (newSlide === undefined) {
          throw "no slide exists for index: " + index
        } else {
          this.currentSlide = newSlide;
          if (this.currentSlideView) {
            this.currentSlideView.remove();
          }

          var slideView = new App.SlideView({model: this.currentSlide, editable: this.editable});
          this.$('#slide-container').html(slideView.render().el);
          this.currentSlideView = slideView;
          this.currentSlideView.bind('saved',this.turnOffEditable)
        }
      }
    },

    slideIndex: function () {
      return this.collection.indexOf(this.currentSlide);
    },

    moveSlide: function (e) {
      var index = this.slideIndex();
      var newIndex;
      if (e.keyCode === this.arrows.right && this.editable === true) {
        this.collection.add({heading: '', content: ''});
      }
      if (e.keyCode === this.arrows.right && index < this.collection.length) {
        newIndex = (index + 1);
      } else if (e.keyCode === this.arrows.left && index > 0) {
        newIndex = (index - 1);
      }
      if (newIndex !== undefined && !this.$('textarea').is(':focus')) {
        router.showSlide(newIndex, this.editable);
      }
    },

    setEditable: function (editable) {
      this.editable = editable;
      editable ? this.$el.addClass('editable') : this.$el.removeClass('editable');


    },

    toggleEditable: function (e) {
      this.editable = !(this.$el.hasClass('editable'));
      this.$el.toggleClass('editable');
      router.showSlide(this.slideIndex(), this.editable);
    },
    turnOffEditable: function () {
      this.$el.removeClass('editable');
      this.editable = false
    }
  });

  var router = new App.Router;
  Backbone.history.start();

});