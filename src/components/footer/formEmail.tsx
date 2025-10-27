"use client";
import React from "react";
import styles from "./footer.module.scss";
import sendImg from "@/../public/icons/sendEmail.svg";
import Image from "next/image";
export const FormEmail = () => {
	return (
		<form action="" onSubmit={(e) => e.preventDefault()}>
			<input placeholder="Введите email" type="email" />
			<button type="submit">
				<Image src={sendImg} alt={"отправить письмо"} />
			</button>
		</form>
	);
};
