document.getElementById("popnotification").innerHTML = `<div class="demo-float"> <span class="df-hide" onclick="document.querySelector('.demo-float').style.display = 'none'"
 ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg></span> <div class="df-logo"></div> <h3>`+xtitlec+`</h3> <p class="excerpt">`+xdescc+`</p> <a class="demo-floata" href="`+xbtn_linkc+`" title="`+xbtn_textc+`">`+xbtn_textc+`</a> 
  <a class="Getthis" href="/" title="أضفها لموقعك" style=" float: left; width: 100%; font-size: 14px; color: #ffffff59; text-align: left; margin: 2px 0; ">أضفها لموقعك</a>
  
  </div> <style>

.demo-float{position:fixed;right:25px;bottom:25px;width:300px;background-color:`+xbgcolorc+`;z-index:99999;padding:15px;border-radius:6px;box-shadow: 0 1px 2px rgba(0,0,0,0.1);text-align: right;color: #fff;}
.df-logo{float: right;width:70px;height:70px;background:#f9f9f9 url(https://2.bp.blogspot.com/-XRKx5EJ5f3s/Xk1GIGhGjXI/AAAAAAAABdY/we0ugbrGhRo8Z8ENP1SYH0yuNYUJydo5wCK4BGAYYCw/s70-c/logo-square.png);margin: 0 0 0 10px;
.rtl .df-logo{float:right;margin:0 0 0 10px}
.demo-float h3{color:`+xtextcolorc+`;font-size:17px;font-weight:600;margin:0 0 7px}
.demo-float p{font-size:13px;color:`+xtextcolorc+`;line-height:1.5em;margin:0}
.demo-floata{    text-decoration: none; float:left;width:100%;height:28px;background-color:`+xbgbtncolorc+`;font-size:14px;color:#fff;text-align:center;line-height:28px;margin:15px 0 0;border-radius:2px;transition:background .17s ease}
.demo-floata:hover{text-decoration: underline;background-color:`+xbgbtncolocrc+`}
.df-hide{position:absolute;top:10px;left:13px;font-size:13px;color:`+xtextcolorc+`;cursor:pointer;transition:color .17s ease}
.rtl .df-hide{right:unset;left:13px}
.df-hide:hover{color:#e74c3c}

</style> 

<script type=\"text\/javascript\"> "; 

document.querySelector("demo-float").style.display = "none";
 <\/script>`;
