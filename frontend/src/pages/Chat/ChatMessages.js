import React, { useContext, useEffect, useRef, useState } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
  TextField,
  ClickAwayListener,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import DeleteIcon from "@material-ui/icons/Delete";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";
import { useHistory } from "react-router-dom";

import AttachFileIcon from "@material-ui/icons/AttachFile";
import CancelIcon from "@material-ui/icons/Cancel";
import CircularProgress from "@material-ui/core/CircularProgress";
import ModalImageCors from "../../components/ModalImageCors";
import { GetApp } from "@material-ui/icons";
import toastError from "../../errors/toastError";
import MicRecorder from "mic-recorder-to-mp3";
import MicIcon from "@material-ui/icons/Mic";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import RecordingTimer from "../../components/MessageInputCustom/RecordingTimer";
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
  },
  inputArea: {
    position: "relative",
    height: "auto",
  },
  input: {
    padding: "20px",
  },
  buttonSend: {
    margin: theme.spacing(1),
  },
  boxLeft: {
    padding: "8px 10px 5px",
    margin: "10px",
    position: "relative",
    backgroundColor: "#ffffff",
    color: "#303030",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  boxRight: {
    padding: "8px 10px 5px",
    margin: "10px 10px 10px auto",
    position: "relative",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
  },
  messageWrapperRight: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
  },
  messageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
    gap: "8px",
  },
  messageHeaderInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  deleteButton: {
    padding: 2,
    marginTop: -4,
    "& svg": {
      fontSize: 16,
    },
  },
  messageContent: {
    flex: 1,
  },
  sendMessageIcons: {
    color: "grey",
  },
  uploadInput: {
    display: "none",
  },
  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
    justifyContent: 'flex-end',
  },
  cancelAudioIcon: {
    color: "red",
  },
  audioLoading: {
    color: green[500],
    opacity: "70%",
  },
  sendAudioIcon: {
    color: "green",
  },
  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },
}));

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const getAvatarUrl = (profileImage, companyId) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (profileImage) {
      return `${backendUrl}/public/company${companyId}/user/${profileImage}`;
    }
    return null;
  };
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [caption, setCaption] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const history = useHistory();

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };


  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setMedias(files);
    }
  };

  const handleOpenTaskModal = () => {
    history.push("/tasks");
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setContentMessage((prevState) => prevState + emoji);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/chats/messages/${messageId}`);
      // A mensagem será removida através do socket
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const checkMessageMedia = (message) => {
    
    if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaPath} />;
    }
    if (message.mediaType === "audio") {
      return (
        <audio controls>
          <source src={message.mediaPath} type="audio/ogg"></source>
        </audio>
      );
    }
    if (message.mediaType === "video") {
      return (
        <video
          className={classes.messageMedia}
          src={message.mediaPath}
          controls
        />
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaPath}
            >
              Download
            </Button>
          </div>
          {/* <Divider /> */}
        </>
      );
    }
  };
  const handleSendMedia = async (e) => {
    setLoading(true);
    e.preventDefault();
    const currentChat = JSON.parse(localStorage.getItem("currentChat"));
    const formData = new FormData();
    formData.append("fromMe", true);
    formData.append("typeArch","chats");
    formData.append("caption", caption);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
      
    });
    try {
      await api.post(`/chats/${currentChat.id}/messages`, formData);
    } catch (err) {
      console.log(err);
      toastError(err);
    }
    setLoading(false);
    setMedias([]);
    setCaption("");
  };
  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };
  const handleUploadAudio = async (e) => {
    setLoading(true);
    e.preventDefault();
    const [, blob] = await Mp3Recorder.stop().getMp3();
    if (blob.size < 10000) {
      setLoading(false);
      setRecording(false);
      return;
    }
       
    const formData1 = new FormData();
    formData1.append("fromMe", true);
    formData1.append("typeArch","chats");
    const currentChat = JSON.parse(localStorage.getItem("currentChat"));
    const filename = `audio-${new Date().getTime()}.mp3`;
    formData1.append("medias", blob, filename);
    formData1.append("body", filename);
    
    try {
      await api.post(`/chats/${currentChat.id}/messages`, formData1);
      // await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
    setRecording(false);
    setLoading(false);
  };
  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Paper 
      className={classes.mainContainer}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={dragging ? { backgroundColor: '#e3f2fd', border: '2px dashed #1976d2' } : {}}
    >
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            if (item.senderId === user.id) {
              return (
                <div key={key} className={classes.messageWrapperRight}>
                  <Box className={classes.boxRight}>
                    <div className={classes.messageContent}>
                      <div className={classes.messageHeader}>
                        <div className={classes.messageHeaderInfo}>
                          <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                            {item.sender.name}
                          </Typography>
                          <Typography variant="caption" style={{ color: '#888' }}>
                            {datetimeToClient(item.createdAt)}
                          </Typography>
                        </div>
                        <IconButton 
                          size="small" 
                          className={classes.deleteButton}
                          onClick={() => handleDeleteMessage(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                      {item.mediaPath && checkMessageMedia(item)}
                      <Typography variant="body2">{item.message}</Typography>
                    </div>
                  </Box>
                  <Avatar 
                    src={getAvatarUrl(item.sender.profileImage, item.sender.companyId)} 
                    alt={item.sender.name}
                    className={classes.messageAvatar}
                  >
                    {!item.sender.profileImage && item.sender.name?.charAt(0)}
                  </Avatar>
                </div>
              );
            } else {
              return (
                <div key={key} className={classes.messageWrapper}>
                  <Avatar 
                    src={getAvatarUrl(item.sender.profileImage, item.sender.companyId)} 
                    alt={item.sender.name}
                    className={classes.messageAvatar}
                  >
                    {!item.sender.profileImage && item.sender.name?.charAt(0)}
                  </Avatar>
                  <Box className={classes.boxLeft}>
                    <div className={classes.messageContent}>
                      <div className={classes.messageHeader}>
                        <div className={classes.messageHeaderInfo}>
                          <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                            {item.sender.name}
                          </Typography>
                          <Typography variant="caption" style={{ color: '#888' }}>
                            {datetimeToClient(item.createdAt)}
                          </Typography>
                        </div>
                      </div>
                      {item.mediaPath && checkMessageMedia(item)}
                      <Typography variant="body2">{item.message}</Typography>
                    </div>
                  </Box>
                </div>
              );
            }
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
        {recording ? (
            <div className={classes.recorderWrapper}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOffIcon className={classes.cancelAudioIcon} />
              </IconButton>
              {loading ? (
                <div>
                  <CircularProgress className={classes.audioLoading} />
                </div>
              ) : (
                <RecordingTimer />
              )}

              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                onClick={handleUploadAudio}
                disabled={loading}
              >
                <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
              </IconButton>
            </div>

          )
            :
            <>
              {medias.length > 0 ?
                <>
                  <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
                    <IconButton
                      aria-label="cancel-upload"
                      component="span"
                      onClick={(e) => { setMedias([]); setCaption(""); }}
                    >
                      <CancelIcon className={classes.sendMessageIcons} />
                    </IconButton>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {loading ? (
                        <CircularProgress className={classes.circleLoading} />
                      ) : (
                        <>
                          <span>{medias[0]?.name}</span>
                          <TextField
                            placeholder="Adicionar legenda..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                          />
                        </>
                      )}
                    </div>
                    
                    <IconButton
                      aria-label="send-upload"
                      component="span"
                      onClick={handleSendMedia}
                      disabled={loading}
                    >
                      <SendIcon className={classes.sendMessageIcons} />
                    </IconButton>
                  </Paper>
                </>
                :
                <React.Fragment>
                  <Input
                    multiline
                    value={contentMessage}
                    onKeyUp={(e) => {
                      if (e.key === "Enter" && contentMessage.trim() !== "") {
                        handleSendMessage(contentMessage);
                        setContentMessage("");
                      }
                    }}
                    onChange={(e) => setContentMessage(e.target.value)}
                    className={classes.input}
                    startAdornment={
                      <InputAdornment position="start">
                        <IconButton
                          aria-label="emojiPicker"
                          component="span"
                          disabled={loading}
                          size="small"
                          onClick={(e) => setShowEmoji((prevState) => !prevState)}
                        >
                          <EmojiEmotionsIcon className={classes.sendMessageIcons} />
                        </IconButton>
                        {showEmoji ? (
                          <div className={classes.emojiBox}>
                            <ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
                              <Picker
                                perLine={16}
                                showPreview={true}
                                showSkinTones={false}
                                onSelect={handleAddEmoji}
                              />
                            </ClickAwayListener>
                          </div>
                        ) : null}
                        <FileInput disableOption={loading} handleChangeMedias={handleChangeMedias} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        {contentMessage ? (
                          <IconButton
                            onClick={() => {
                              if (contentMessage.trim() !== "") {
                                handleSendMessage(contentMessage);
                                setContentMessage("");
                              }
                            }}
                            className={classes.buttonSend}
                          >
                            <SendIcon />
                          </IconButton>

                        )

                          : (
                            <IconButton
                              aria-label="showRecorder"
                              component="span"
                              disabled={loading}
                              onClick={handleStartRecording}
                            >
                              <MicIcon className={classes.sendMessageIcons} />
                            </IconButton>
                          )

                        }
                      </InputAdornment>
                    }
                  />
                </React.Fragment>
              }
            </>
          }
        </FormControl>
      </div>
    </Paper>
  );
}


const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption}
        >
          <AttachFileIcon className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};
