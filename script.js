$(document).ready(function() {
  const apiRoot = 'https://rocky-hollows-26459.herokuapp.com/v1/';
  const datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  const booksContainer = $('[data-books-container]');

  var availableBooks = {};

  // init
  getAllBooks();
  scheduledBookSize();
  setInterval(scheduledBookSize, 10*1000);

  function scheduledBookSize() {
    $.ajax({
      url: apiRoot + 'countAllBooks',
      method: 'GET',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function (data) {
        window.alert("Every 10 second reminder: current number of books in the database equals " + data + ". In case you can't see the updates in the database please refresh the page.")
      }
    });
  }

  function createElement(data) {
    const element = $(datatableRowTemplate).clone();

    element.attr('data-book-id', data.id);
    element.find('[data-book-author-section] [data-book-author-paragraph]').text(data.author);
    element.find('[data-book-author-section] [data-book-author-input]').val(data.author);

    element.find('[data-book-title-section] [data-book-title-paragraph]').text(data.title);
    element.find('[data-book-title-section] [data-book-title-input]').val(data.title);

    element.find('[data-book-year-section] [data-book-year-paragraph]').text(data.yearOfPublication);
    element.find('[data-book-year-section] [data-book-year-input]').val(data.yearOfPublication);

    return element;
  }

  function handleDatatableRender(bookData) {
    booksContainer.empty();
    bookData.forEach(function(book) {
     createElement(book).appendTo(booksContainer);
    });
  }

  function getAllBooks() {
    const requestUrl = apiRoot + 'getBooks';

    $.ajax({
      url: requestUrl,
      method: 'GET',
      contentType: "application/json",
      success: handleDatatableRender
    });
  }

  function handleBookUpdateRequest() {
    var parentEl = $(this).parents('[data-book-id]');
    var bookId = parentEl.attr('data-book-id');
    var bookAuthor = parentEl.find('[data-book-author-input]').val();
    var bookTitle = parentEl.find('[data-book-title-input]').val();
    var bookYearOfPublication = parentEl.find('[data-book-year-input]').val();
    var requestUrl = apiRoot + 'updateBook';

    $.ajax({
      url: requestUrl,
      method: "PUT",
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        id: bookId,
        author: bookAuthor,
        title: bookTitle,
        yearOfPublication: bookYearOfPublication
      }),
      success: function(data) {
        parentEl.attr('data-book-id', data.id).toggleClass('datatable__row--editing');
        parentEl.find('[data-book-author-paragraph]').text(bookAuthor);
        parentEl.find('[data-book-title-paragraph]').text(bookTitle);
        parentEl.find('[data-book-year-paragraph]').text(bookYearOfPublication);
      }
    });
  }

  function handleBookDeleteRequest() {
    var parentEl = $(this).parents('[data-book-id]');
    var bookId = parentEl.attr('data-book-id');
    var requestUrl = apiRoot + 'deleteBook';

    $.ajax({
      url: requestUrl + '?bookId=' + bookId,
      method: 'DELETE',
      success: function() {
        parentEl.slideUp(400, function() { parentEl.remove(); });
      }
    })
  }

  function handleBookSubmitRequest(event) {
    event.preventDefault();

    var bookId = Math.random();
    var bookAuthor = $(this).find('[name="author"]').val();
    var bookTitle = $(this).find('[name="title"]').val();
    var bookYearOfPublication = $(this).find('[name="yearOfPublication"]').val();

    var requestUrl = apiRoot + 'createBook';

    $.ajax({
      url: requestUrl,
      method: 'POST',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        id: bookId, //new line for H2 configuration as this database doesn't support autoincrement custom id.
        author: bookAuthor,
        title: bookTitle,
        yearOfPublication: bookYearOfPublication
      }),
         success: getAllBooks()
    });
  }

  function toggleEditingState() {
    var parentEl = $(this).parents('[data-book-id]');
    parentEl.toggleClass('datatable__row--editing');

    var bookAuthor = parentEl.find('[data-book-author-paragraph]').text();
    var bookTitle = parentEl.find('[data-book-title-paragraph]').text();
    var bookYearOfPublication = parentEl.find('[data-book-year-paragraph]').text();

    parentEl.find('[data-book-author-input]').val(bookAuthor);
    parentEl.find('[data-book-title-input]').val(bookTitle);
    parentEl.find('[data-book-year-input]').val(bookYearOfPublication);
  }

function searchFor() {
  var parentEl = $(this).parents('[data-book-id]');
  var bookAuthor = parentEl.find('[data-book-author-input]').val();
  var bookTitle = parentEl.find('[data-book-title-input]').val();
  var bookYearOfPublication = parentEl.find('[data-book-year-input]').val();

  window.open('https://www.google.com/search?tbm=bks&q=' + bookAuthor + " " + bookTitle + " " + bookYearOfPublication);
}

   function getDetails() {
          window.close();
     var parentEl = $(this).parents('[data-book-id]');
    var book = parentEl.find('[data-book-author-input]').val() + " " +  parentEl.find('[data-book-title-input]').val() + " " +  parentEl.find('[data-book-year-input]').val();
     window.open('https://marcinpekala.github.io/details.html') + localStorage.clear() + localStorage.setItem('book', JSON.stringify(book));
   }

   function setDetails() {

    var search = localStorage.getItem('book');

    if(search == "")
    {
      alert("The value from API is null");
    } else if(search == null) {
       alert("The value from API is null");
     } else if(search == "null") {
      alert("The value from API is null");
    } else {
      var url = "";
      var img = "";
      var title = "";
      var author = "";

      $.get("https://www.googleapis.com/books/v1/volumes?q=" + search, function(response){
        for(i=0;i<response.items.length;i++)
        {
          title=$('<h5 class="center-align white-text">' + response.items[i].volumeInfo.title + '</h5>');
          author=$('<h5 class="center-align white-text"> By:' + response.items[i].volumeInfo.authors + '</h5>');
          img = $('<img class="aligning card z-depth-5" id="dynamic"><br><a href=' + response.items[i].volumeInfo.infoLink + '><button id="imagebutton">Read More</button></a>');
          url= response.items[i].volumeInfo.imageLinks.thumbnail;
          img.attr('src', url);
            title.appendTo('#result');
          author.appendTo('#result');
          img.appendTo('#result');
        }
      });
    }
     return false;
    }

  function switchVaadin() {
      window.open('http://localhost:8082/bookView');
      window.close();
  }

  function accessH2Database() {
    window.open('http://localhost:8080/h2');
  }

  function accessDocumentation() {
    window.open('http://localhost:8080/swagger-ui.html');
  }

  function handleDeleteAllBooks() {
    var answer = window.confirm("Are you sure you want to delete all books' from the database? This proccess will be irreversible.")
    var confirm = window.confirm("Please confirm your choice.")

    if (answer) {
      if (confirm) {
        $.ajax({
          url: apiRoot + 'deleteAllBooks',
          method: 'DELETE',
          success: getAllBooks
          });
        } else {
      // do nothing
      }
      }
    else {
     // do nothing
    }
  }

  function goBack() {
    window.open('https://marcinpekala.github.io/index.html');
    window.close();
  }

  $('[go-back-button]').on('click', goBack);
  $('[search-details-button]').on('click', setDetails);
  $('[data-book-add-form]').on('submit', handleBookSubmitRequest);
  $('[vaadin-click]').on('click', switchVaadin)
  $('[h2-button]').on('click', accessH2Database);
  $('[doc-button]').on('click', accessDocumentation);
  $('[data-book-deleteall-button]').on('click', handleDeleteAllBooks);

  booksContainer.on('click','[data-book-edit-button]', toggleEditingState);
  booksContainer.on('click', '[data-book-search-button]', searchFor);
  booksContainer.on('click', '[data-book-details-button]', getDetails);
  booksContainer.on('click','[data-book-edit-abort-button]', toggleEditingState);
  booksContainer.on('click','[data-book-submit-update-button]', handleBookUpdateRequest);
  booksContainer.on('click','[data-book-delete-button]', handleBookDeleteRequest);
});
