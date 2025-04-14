"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Cookies from "js-cookie";

function FileItem({ no, originFilename, onDelete }) {
  return (
    <li>
      <a
        href={`http://localhost:8020/board/file/download?fileNo=${no}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {originFilename}
      </a>
      <button type='button' data-no={no} onClick={onDelete}>
        삭제
      </button>
    </li>
  );
}

export default function Board() {
  const [board, setBoard] = useState({
    no: "",
    title: "",
    content: "",
    writer: { name: "" },
    createDate: "",
    viewCount: 0,
    attachedFiles: [],
  });
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();
  const params = useParams();
  const no = params.no;
  const formRef = useRef(null);

  const handleDeleteBoard = useCallback(async (e) => {
    e.preventDefault();
    const jwtToken = Cookies.get("jwt_token");

    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8020/board/delete`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
        body: new URLSearchParams({ no: no }),
      });

      const result = await response.json();
      if (result.status == "failure") {
        throw new Error(result.data);
      }

      router.push("./");
    } catch (error) {
      alert("게시글 삭제 실패!");
      console.log(error);
    }
  }, []);

  const handleDeleteFile = useCallback(async (e) => {
    e.preventDefault();
    const jwtToken = Cookies.get("jwt_token");

    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const fileNo = parseInt(e.currentTarget.dataset.no);

      const response = await fetch(`http://localhost:8020/board/file/delete`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
        body: new URLSearchParams({ fileNo: fileNo }),
      });

      const result = await response.json();

      if (result.status == "failure") {
        throw new Error(result.data);
      }

      setBoard((prevBoard) => ({
        ...prevBoard,
        attachedFiles: prevBoard.attachedFiles.filter((file) => file.no !== fileNo),
      }));
    } catch (error) {
      alert("파일 삭제 실패!");
      console.log(error);
    }
  }, []);

  const handleUpdateSubmit = useCallback(async (e) => {
    e.preventDefault();
    const jwtToken = Cookies.get("jwt_token");

    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8020/board/update`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
        body: new FormData(formRef.current),
      });

      const result = await response.json();

      if (result.status == "failure") {
        throw new Error(result.data);
      }

      setReloadKey(reloadKey + 1);
    } catch (error) {
      alert("파일 변경 실패!");
      console.log(error);
    }
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
  }, [reloadKey]);

  return (
    <>
      <h1 className={styles.heading}>게시글</h1>
      <form ref={formRef} method='post' encType='multipart/form-data' onSubmit={handleUpdateSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor='no'>번호:</label>
          <input type='text' id='no' name='no' value={board.no} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='title'>제목:</label>
          <input
            type='text'
            id='title'
            name='title'
            value={board.title}
            onChange={(e) => setBoard((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='content'>내용:</label>
          <textarea
            id='content'
            name='content'
            value={board.content}
            onChange={(e) => setBoard((prev) => ({ ...prev, content: e.target.value }))}
            required
          ></textarea>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='files'>첨부파일:</label>
          <input type='file' id='files' name='files' multiple />
          <ul>
            {board.attachedFiles.map((file, index) => (
              <FileItem key={file.no} {...file} onDelete={handleDeleteFile} />
            ))}
          </ul>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='writer'>작성자:</label>
          <input type='text' id='writer' value={board.writer.name} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='createDate'>작성일:</label>
          <input type='text' id='createDate' value={board.createDate} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor='viewCount'>조회수:</label>
          <input type='text' id='viewCount' value={board.viewCount} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <input type='submit' value='변경' />
          <input type='button' value='삭제' onClick={handleDeleteBoard} />
        </div>
      </form>
      <a href='./'>목록</a>
    </>
  );
}
