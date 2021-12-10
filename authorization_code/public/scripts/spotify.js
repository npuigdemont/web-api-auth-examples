
(function() {

       // Obtains parameters from the hash of the URL
         
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }

        var userProfileSource = document.getElementById('user-profile-template').innerHTML,
            userProfileTemplate = Handlebars.compile(userProfileSource),
            userProfilePlaceholder = document.getElementById('user-profile');

        var oauthSource = document.getElementById('oauth-template').innerHTML,
            oauthTemplate = Handlebars.compile(oauthSource),
            oauthPlaceholder = document.getElementById('oauth');

        var params = getHashParams();

        var access_token = params.access_token,
            refresh_token = params.refresh_token,
            error = params.error;

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (access_token) {
            // render oauth info
            oauthPlaceholder.innerHTML = oauthTemplate({
             access_token: access_token,
              refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                  $('#login').hide();
                  $('#loggedin').show();
                }
            });
          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }

          document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
              url: '/refresh_token',
              data: {
                'refresh_token': refresh_token
              }
            }).done(function(data) {
              access_token = data.access_token;
              oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
              });
            });
          }, 
          
          false);

          //netejar els resultats
          $("#clear_results").click(function(){
            $('#top_tracks').empty();
            $('#artists').empty();
          });

 // afegir esdeveniments als botons
 document.getElementById('button').addEventListener('click', function(){
   $('#artists').empty();
   $('#top_tracks').empty();
   console.log($("#name").val());
   var artistName = $("#name").val();

   //si hi ha espais
   if ($("#name").val().indexOf(" ") != -1){
     var replaceSpace = $.trim($("#name").val());
     artistName = replaceSpace.replace(/ /g, "%20");
   }
 
        if (access_token) {

          $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + artistName + '&type=artist', market: "ES",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
             
              console.log(response);
              //mostrar per pantalla els artistes que contenen el nom amb un botó cadascú
              console.log(response.artists.items[0].name);

              var artistsArray= response.artists.items;
              var $id;

             $.each(artistsArray, function(key, value){

              $id = artistsArray[key].name;

               var $name= artistsArray[key].name;
               var $nameDiv = $("<div class ='name'/>");
               var $button = $("<button class='button' id=" +$id + "/>");
               var $object = $("<div class='object'/>");

               $nameDiv.append($name);
               $button.append($nameDiv);
               $object.append($button);
               $("artists").append($object);
             });

             $('.button').click(function(){
               console.log(this.id);

               $.ajax({
                 url:'https://api.spotify.com/v1/artists/' + this.id + '/top-tracks/country=ES',
                 type:"GET",
                 headers: {
                   'Authorization': 'Bearer ' + access_token,
                   'Content-Type': 'application/json',
                   'Accept': 'application/json'
                 },
                 success:function(result){
                   console.log(result);

                   $.each(result.tracks, function(key, value){
                     //console.log(value.name + " " + value.uri);
                     var $top_track = value.name;
                     var $link = $('<a/>').addClass("link").attr("href",value.uri);
                     var $new_button = $("<button class='new_button'/>");
                     var $new_object = $("<div class='new_object'/>");

                     $new_button.append($top_track);
                     $link.append($new_button);
                     $new_object.append($link);
                     $("#top_tracks").append($new_object);
                   });
                  
                 },
                 error:function(error){console.log(error)}
               });
             });
              }
         
         });
        } else {alert('There was an error during the authentication');}});
      };
})();
    