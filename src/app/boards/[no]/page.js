"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import Cookies from "js-cookie";

export default function Boards() {
  const [board, setBoard] = useState({
    no: "",
    title: "",
    content: "",
    writer: { name: "" },
    createDate: "",
    viewCount: 0
  });
  const params = useParams();
  const no = params.no;
  
  const handleDeleteBoard = useCallback(async (e) => {
    e.preventDefault();
    console.log("삭제 요청");
  }, []);

  useEffect(() => {
    const jwtToken = Cookies.get("jwt_token");
    
    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const fetchBoardDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8020/board/detail?no=${no}`, {
          headers: {
            Authorization: "Bearer " + jwtToken,
          },
        });
        if (!response.ok) { 
          throw new Error("조회 요청 실패!");
        }
        const result = await response.json();
        if (result.status == "success") {
          setBoard(result.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBoardDetail();
  }, []);

  return (
    <>
      <h1 className={styles.heading}>게시글</h1>
      <form method="post" encType="multipart/form-data">
        <div className={styles["form-group"]}>
          <label htmlFor="no">번호:</label>
          <input type="text" id="no" name="no" value={board.no} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="title">제목:</label>
          <input type="text" id="title" name="title" value={board.title} 
            onChange={(e) =>
              setBoard((prev) => ({ ...prev, title: e.target.value }))
            } 
            required />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="content">내용:</label>
          <textarea 
            id="content" name="content" value={board.content} 
            onChange={(e) =>
              setBoard((prev) => ({ ...prev, content: e.target.value }))
            }
            required></textarea>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="files">첨부파일:</label>
          <input type="file" id="files" name="files" multiple />
          <ul id="attached-files"></ul>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="writer">작성자:</label>
          <input type="text" id="writer" value={board.writer.name}  readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="createDate">작성일:</label>
          <input type="text" id="createDate" value={board.createDate} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="viewCount">조회수:</label>
          <input type="text" id="viewCount" value={board.viewCount} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <input type="submit" value="변경" />
          <input type="button" value="삭제" onClick={handleDeleteBoard} />
        </div>
      </form>
      <a href="list.html">목록</a>
    </>
  );
}
