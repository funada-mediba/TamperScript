// ==UserScript==
// @name         にっぽうをてきとうに。
// @namespace    https://github.com/YatsushiroMasato/TamperScript
// @version      ばーじょんつー！
// @description  日報を簡単につけることができるかんじのやつ
// @author       Masato Yatsushiro <yatsushiro@mediba.jp>
// @match        http://mediba-pjtweb01/ip_web/scripts/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(function ($) {
  // wrapper追加
  $('#Form1').wrap('<div class="container-fluid" id="wrap"></div>');
  $('br').remove(); // <br>は必要ないので全部消す
  $('hr').remove(); // <hr>は必要ないので全部消す
  $('img').addClass('hidden'); // 表示されてるダサいタイトル画像とかを全部隠す
  $('table').addClass('table').removeAttr('border').removeAttr('bordercolor').prepend("<thead><tr></tr></thead>");  // テーブルのスタイルをbootstrap風に変更
  $('.DefTable').addClass('table-bordered').removeClass('DefTable');
  $('.LblColor').addClass('bg-success').addClass('text-muted');  // テーブルの色を変更

  // bootstrap_css
  var bootstrap_css = `
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  `;
  $('head').append(bootstrap_css);

  // jquery_js
  var jquery_js = `
  <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.js"></script>
  `;
  $('head').append(jquery_js);

  var contents = `
  <div class="list-group list-group-flush" id="PJnum">
  </div>
  <div class="btn-toolbar" id="work_time">
    <div class="btn-group" role="group">
      <a class='btn btn-info'>00:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-info'>01:00</a>
      <a class='btn btn-info'>01:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-info'>02:00</a>
      <a class='btn btn-info'>02:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-info'>03:00</a>
      <a class='btn btn-info'>03:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-info'>04:00</a>
      <a class='btn btn-info'>04:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-info'>05:00</a>
      <a class='btn btn-info'>05:30</a>
    </div>
    <div class="btn-group" role="group">
      <a class='btn btn-success' id='all_time'></a>
    </div>
  </div>
  `;
  //$('#txtProNo1').parent().parent().parent().parent().after(contents);
  $('#btnTsuika').parent().after(contents);


  var save_strage_contents = `
  <div class="container" id="PJsave" style="display: none;">
    <div class="row">
      <div class="col-lg-6">
        <div class="input-group">
          <span class="input-group-addon">
            プロジェクトコード
          </span>
          <input type="text" class="form-control" id="pj_code" placeholder="例）KK-16008103　とか　JU-00000001-0xx　など">
        </div>
      </div>
    </div>
    <div class="row" style="padding-top:10px;">
      <div class="col-lg-6">
        <div class="input-group">
          <span class="input-group-addon">
            プロジェクト名
          </span>
          <input type="text" class="form-control" id="pj_name" placeholder="例) 販管費：広告システム開発部　など">
        </div>
      </div>
    </div>
    <div class="row" style="padding-top:10px;">
      <div class="col-lg-6">
        <a class="pull-right btn btn-primary">追加</a>
        <label class="btn btn-danger">PJ全削除</label>
      </div>
    </div>
  </div>
  `;
  $('#wrap').prepend(save_strage_contents);

  var navi_html = `
  <nav class="navbar navbar-light" style="background-color: #eeeeee;">
    <a class="navbar-brand" id="back_link"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> 戻る</a>
    <a class="navbar-brand" id="add_pj"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> PJ登録</a>
    <a class="navbar-brand" id="list_pj"><span class="glyphicon glyphicon-list" aria-hidden="true"></span> PJ一覧</a>
    <a class="navbar-brand pull-right" id="logout_link"><span class="glyphicon glyphicon-off" aria-hidden="true"></span> ログアウト</a>
    <a class="navbar-brand pull-right" id="menu_link"><span class="glyphicon glyphicon-home" aria-hidden="true"></span> メニュー</a>
  </nav>
  `;

  // ヘッダーメニューを非表示に。
  var nav_header = $('#Header0011_btnBack').parent().parent().parent().parent();
  nav_header.addClass('hidden');
  var nav_footer = $('#Footer0011_btnBack').parent().parent().parent().parent();
  nav_footer.addClass('hidden');
  // 代わりのボタンを追加する。
  $('#wrap').prepend(navi_html);

  // ----------------プロジェクト関係-------------------

  // デフォルトの入力欄を非表示に
  var default_table = $('#txtProNo1').parent().parent().parent().parent();
  default_table.addClass('hidden');
  // デフォルトの追加ボタンを非表示に
  var default_add_btn = $('#btnTsuika');
  default_add_btn.parent().addClass('hidden');

  // webStrageから自分のPJコードを取得
  var get_my_pj = window.localStorage.getItem('myPJ');

  if (!get_my_pj) {
    // PJがwebStrageから取り出せなかった場合
    $('#PJnum').append(`
    <div class="list-group-item">
        プロジェクトコードが存在しません。PJ登録から設定してください。
    </div>`);
    // var my_pj = 'KK-16008103@Cygnus 開発;KH-00014010@販管費：広告システム開発部;JU-00000001-0xx@2017年度auサービス運用保守業務;';
  } else {
    // PJがwebStrageから取り出せた場合
    // 行末の ; を削除した後、配列化
    var pj_list = get_my_pj.substr(0, get_my_pj.length - 1).split(";");

    // PJコードを表示させる
    $.each(pj_list, function () {
      var pj_data = this.split("@");
      var text = `
      <a class="list-group-item">
      <span>` + pj_data[0] + `</span>
      <div>` + pj_data[1] + `</div>
      </a>`;
      $('#PJnum').append(text);
    });
  }

  // 実働時間を取得
  var work_time_str = $('#btnCalcJitsudouJikan').parent().text().slice(-5).trim();
  var work_time_arr = work_time_str.split(":");
  var work_time_int = 60 * parseInt(work_time_arr[0]) + parseInt(work_time_arr[1]);

  // 合計作業時間を取得
  var sum_work_time_str = $('#Form1 table:last-child td:last-child').text();
  var sum_work_time_arr = sum_work_time_str.split(":");
  var sum_work_time_int = 60 * parseInt(sum_work_time_arr[0]) + parseInt(sum_work_time_arr[1]);

  // 計算
  var time = Math.abs(work_time_int - sum_work_time_int);

  // hh:mm の形に戻す
  xhh = Math.floor(time / 60);
  xmm = time % 60;
  var result_time = (("0" + xhh).slice(-2)) + ":" + (("0" + xmm).slice(-2));

  // ボタンに反映
  $('#all_time').text(result_time);

  // ---------- 以下、ユーザーアクションを起こしたときの処理 ----------

  // ---------------- ヘッダー関係 ----------------
  // 戻るボタンを押したときの処理
  $('#back_link').click(function () {
    $('#Header0011_btnBack').click();
  });

  // メニューボタンを押したときの処理
  $('#menu_link').click(function () {
    $('#Header0011_btnMenu').click();
  });

  // PJ登録ボタン押下時の表示非表示制御
  $('#add_pj').click(function () {
    $('#PJsave').toggle();
  });

  // ログアウトボタン押したときの処理
  $('#logout_link').click(function () {
    $('#Header0011_btnLogout').click();
  });

  // プロジェクト追加を押したときの処理
  $('#PJsave a').click(function () {
    var pj_code = $('#pj_code').val();
    var pj_name = $('#pj_name').val();
    if (pj_code && pj_name) {
      var pj = pj_code + "@" + pj_name + ";";
      get_my_pj ? get_my_pj += pj : get_my_pj = pj;

      // webStrageに保存
      window.localStorage.setItem('myPJ', get_my_pj);
      location.reload();
    } else {
      console.log("なにもしない");
      $('.collapse').collapse('toggle');
    }
  });

  // プロジェクト全削除を押したときの処理
  $('#PJsave label').click(function () {
    window.localStorage.removeItem('myPJ');
    location.reload();
  });

  // -------------- プロジェクト関係 --------------
  // プロジェクトコードを選択したときの処理
  $('#PJnum a').click(function () {
    console.log($(this).children('span').text());

    $(this).addClass('active');
    $(this).siblings().removeClass('active');

    var mp_arr = $(this).children('span').text().split("-");
    if (mp_arr[2] != "0xx") {
      mp_arr[2] = "";
    } else {
      // ここの処理ロジックおかしいけど、放置してる。　なおしたいひと勝手になおして。
      mp_arr[2] = new Date().getMonth() - 2;
    }
    $("input[name='txtProNo1']").val(mp_arr[0]);
    $("input[name='txtProNo2']").val(mp_arr[1]);
    $("input[name='txtProEdaNo']").val(mp_arr[2]);
  });

  // 時間をクリックした時の処理
  $('#work_time a').click(function () {
    var time = $(this).text();
    $("input[name='txtSagyoJikan']").val(time);
    $('#btnTsuika').click();
  });
  $('#all_time').click(function () {
    var time = $(this).text();
    $("input[name='txtSagyoJikan']").val(time);
    $('#btnTsuika').click();
  });

})(jQuery.noConflict(true));
