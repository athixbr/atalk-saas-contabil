import React, { useState } from "react";
import { Box, Divider, IconButton, Popover, Tooltip, makeStyles } from "@material-ui/core";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatStrikethroughIcon from "@material-ui/icons/FormatStrikethrough";
import CodeIcon from "@material-ui/icons/Code";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import Mood from "@material-ui/icons/Mood";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { wrapSelection, prefixLines, insertAtCursor } from "./whatsappMarkdown";

const useStyles = makeStyles((theme) => ({
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: theme.spacing(0.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.default,
  },
  divider: { height: 22, margin: theme.spacing(0, 0.5) },
}));

const Toolbar = ({ textareaRef, value, onChange }) => {
  const classes = useStyles();
  const [emojiAnchor, setEmojiAnchor] = useState(null);

  const applyChange = (result) => {
    const el = textareaRef.current;
    onChange(result.value);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selStart, result.selEnd);
    });
  };

  const withSelection = (fn) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    applyChange(fn(value, start, end));
  };

  const handleBold = () => withSelection((v, s, e) => wrapSelection(v, s, e, "*"));
  const handleItalic = () => withSelection((v, s, e) => wrapSelection(v, s, e, "_"));
  const handleStrike = () => withSelection((v, s, e) => wrapSelection(v, s, e, "~"));
  const handleMono = () => withSelection((v, s, e) => wrapSelection(v, s, e, "```"));
  const handleList = () => withSelection((v, s, e) => prefixLines(v, s, e, "- "));

  const handleEmojiSelect = (emoji) => {
    withSelection((v, s, e) => insertAtCursor(v, s, e, emoji.native));
    setEmojiAnchor(null);
  };

  return (
    <Box className={classes.bar}>
      <Tooltip title="Negrito (*texto*)">
        <IconButton size="small" onClick={handleBold}><FormatBoldIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Tooltip title="Itálico (_texto_)">
        <IconButton size="small" onClick={handleItalic}><FormatItalicIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Tooltip title="Tachado (~texto~)">
        <IconButton size="small" onClick={handleStrike}><FormatStrikethroughIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Tooltip title="Monoespaçado (```texto```)">
        <IconButton size="small" onClick={handleMono}><CodeIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Divider orientation="vertical" className={classes.divider} />
      <Tooltip title="Lista">
        <IconButton size="small" onClick={handleList}><FormatListBulletedIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Divider orientation="vertical" className={classes.divider} />
      <Tooltip title="Emoji">
        <IconButton size="small" onClick={(e) => setEmojiAnchor(e.currentTarget)}>
          <Mood fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Picker
          perLine={8}
          theme="light"
          showPreview={false}
          showSkinTones={false}
          onSelect={handleEmojiSelect}
        />
      </Popover>
    </Box>
  );
};

export default Toolbar;
