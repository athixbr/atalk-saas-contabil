import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

const useStyles = makeStyles(() => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		cursor: "pointer",
	},
	overlay: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.9)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 9999,
	},
	header: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		display: "flex",
		justifyContent: "flex-end",
		padding: "8px 12px",
		gap: 4,
	},
	headerBtn: {
		background: "rgba(0,0,0,0.5)",
		border: "none",
		borderRadius: 4,
		color: "#fff",
		cursor: "pointer",
		padding: "6px 10px",
		fontSize: 18,
		lineHeight: 1,
		"&:hover": {
			background: "rgba(255,255,255,0.2)",
		},
	},
	fullImage: {
		maxWidth: "95vw",
		maxHeight: "90vh",
		objectFit: "contain",
		userSelect: "none",
	},
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!imageUrl) return;
		const fetchImage = async () => {
			try {
				const isCdn =
					imageUrl.includes("digitaloceanspaces.com") ||
					imageUrl.includes("cdn.digitaloceanspaces.com");
				if (isCdn) {
					setBlobUrl(imageUrl);
					return;
				}
				const { data, headers } = await api.get(imageUrl, {
					responseType: "arraybuffer",
				});
				const url = window.URL.createObjectURL(
					new Blob([data], { type: headers["content-type"] })
				);
				setBlobUrl(url);
			} catch (err) {
				setBlobUrl(imageUrl);
			} finally {
				setFetching(false);
			}
		};
		fetchImage();
	}, [imageUrl]);

	useEffect(() => {
		if (!open) return;
		const handleKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open]);

	const handleDownload = useCallback(async () => {
		const src = blobUrl || imageUrl;
		if (!src) return;

		const filename =
			imageUrl.split("/").pop().split("?")[0] || "imagem";

		let downloadUrl = src;
		let isTemp = false;

		if (!src.startsWith("blob:")) {
			try {
				const res = await fetch(src);
				if (!res.ok) throw new Error("fetch failed");
				const blob = await res.blob();
				downloadUrl = URL.createObjectURL(blob);
				isTemp = true;
			} catch {
				window.open(src, "_blank");
				return;
			}
		}

		const a = document.createElement("a");
		a.style.display = "none";
		a.href = downloadUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		if (isTemp) {
			setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
		}
	}, [blobUrl, imageUrl]);

	const displayUrl = fetching ? imageUrl : blobUrl;

	return (
		<>
			<img
				className={classes.messageMedia}
				src={displayUrl}
				alt="imagem"
				onClick={() => setOpen(true)}
			/>
			{open && (
				<div
					className={classes.overlay}
					onClick={() => setOpen(false)}
				>
					<div
						className={classes.header}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className={classes.headerBtn}
							title="Baixar"
							onClick={handleDownload}
						>
							&#8203;
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
							</svg>
						</button>
						<button
							className={classes.headerBtn}
							title="Fechar"
							onClick={() => setOpen(false)}
						>
							&#x2715;
						</button>
					</div>
					<img
						src={displayUrl}
						alt="imagem"
						className={classes.fullImage}
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}
		</>
	);
};

export default ModalImageCors;
