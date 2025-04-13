"use client";



export default function Boards() {

  async function submit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8010/auth/login", {
        method: "POST",
        body: new URLSearchParams({
          email: txtEmail.current.value,
          password: txtPassword.current.value,
        }),
      });
      if (!response.ok) {
        throw new Error("로그인 요청 실패!");
      }
      const result = await response.json();

      if (result.status == "success") {
        setToken(result.data); // JWT 토큰을 AuthProvider에 저장
        router.push("http://localhost:3010/"); // 로그인 성공 시 메인 페이지로 이동
        
      } else {
        setErrorMessage("사용자 인증 실패!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <html>
  <head>
    <meta charset="UTF-8" />
    <title>게시글 목록</title>
    <link rel="stylesheet" href="/css/common.css" />
    <style>
      h1 {
        text-align: center;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f0f0f0;
      }

      tr:nth-child(even) {
        background-color: #f9f9f9;
      }

      tr:hover {
        background-color: #f5f5f5;
      }
    </style>
    <script src="http://localhost:3010/js/common.js"></script>
    <script src="/js/app.js"></script>
  </head>
  <body>
    <div id="page-content">
      <h1>게시글 목록</h1>
      <a href="form.html">새 게시글</a>
      <table>
        <thead>
          <tr>
            <th>게시글 번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>생성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <script id="tr-template" type="text/handlerbars">
      {{#each data}}
      <tr>
          <td>{{no}}</td>
          <td><a href="detail.html?no={{no}}">{{title}}</a></td>
          <td>{{writer.name}}</td>
          <td>{{createDate}}</td>
          <td>{{viewCount}}</td>
      </tr>
      {{/each}}
    </script>

    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>
    <script>
      const tbody = document.querySelector("#page-content tbody");
      const trTemplate = document.querySelector("#tr-template");

      fetch(`${__restServer}/board/list`, {
        headers: {
          Authorization: "Bearer " + __jwtToken,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          const template = Handlebars.compile(trTemplate.innerHTML);
          tbody.innerHTML = template(result);
        });
    </script>
  </body>
</html>

    </>
  );
}
