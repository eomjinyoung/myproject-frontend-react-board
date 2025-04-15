"use client";

import { useRef } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();
  const formRef = useRef(null); // 폼 전체를 참조

  async function handleSubmit(e) {
    e.preventDefault();
    const jwtToken = Cookies.get("jwt_token");

    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      e.preventDefault();

      const response = await fetch(`http://110.165.18.171:8020/board/add`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
        body: new FormData(formRef.current),
      });
      const result = await response.json();
      if (result.status == "failure") {
        alert("게시글 등록 실패!");
        throw new Error("게시글 등록 실패!");
      }

      router.push("/boards");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <h1 className={styles.heading}>새 게시글</h1>
      <form ref={formRef} onSubmit={handleSubmit} method='POST' encType='multipart/form-data'>
        <div className={styles["form-group"]}>
          <label htmlFor='title'>제목:</label>
          <input type='text' id='title' name='title' required />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='content'>내용:</label>
          <textarea id='content' name='content' required></textarea>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='files'>첨부파일:</label>
          <input type='file' id='files' name='files' multiple />
        </div>
        <div className={styles["form-group"]}>
          <input type='submit' value='등록' />
        </div>
      </form>
    </>
  );
}
