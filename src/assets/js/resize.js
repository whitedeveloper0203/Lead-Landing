$(document).ready(function(){
    $("#fileUpload").hover(function(){
        $('#pic-select-overlay1').removeClass();
      }, function(){
        $('#pic-select-overlay1').addClass('d-none');
    });
});