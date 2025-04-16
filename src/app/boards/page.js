"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";

function BoardItem({ no, title, writer, createDate, viewCount }) {
  return (
    <tr>
      <td>{no}</td>
      <td>
        <Link href={`/boards/${no}`}>{title}</Link>
      </td>
      <td>{writer.name}</td>
      <td>{createDate}</td>
      <td>{viewCount}</td>
    </tr>
  );
}

export default function Boards() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const jwtToken = Cookies.get("jwt_token");

    if (!jwtToken) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const fetchBoardList = async (jwtToken) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOARD_REST_API_URL}/board/list`, {
          headers: {
            Authorization: "Bearer " + jwtToken,
          },
        });
        if (!response.ok) {
          throw new Error("목록 요청 실패!");
        }
        const result = await response.json();
        if (result.status == "success") {
          setList(result.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBoardList(jwtToken);
  }, []);

  return (
    <>
      <h1 className={styles.heading}>게시글 목록</h1>
      <Link href={"/boards/new"}>새 게시글</Link>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>게시글 번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>생성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, index) => (
            <BoardItem key={item.no} {...item} />
          ))}
        </tbody>
      </table>
    </>
  );
}
