import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import CampaignIcon from "@material-ui/icons/Send";
import PersonIcon from "@material-ui/icons/Person";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import Chip from '@material-ui/core/Chip';
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";
import moment from "moment";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  dialogPaper: {
    borderRadius: "20px",
    overflow: "hidden",
  },

  dialogTitle: {
    background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
    color: "#fff",
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  dialogTitleIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "12px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButton: {
    color: "#fff",
  },

  sectionTitle: {
    fontWeight: 700,
    color: "#1A4783",
    fontSize: "0.95rem",
    marginBottom: "8px",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  sectionDivider: {
    margin: "4px 0 16px 0",
    backgroundColor: "#eef1f7",
  },

  tabs: {
    background: "#f2f2f2",
    border: "1px solid #e6e6e6",
    borderRadius: "10px",
    minHeight: "40px",
  },

  submitButton: {
    borderRadius: "10px",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
    boxShadow: "0 4px 12px rgba(26,71,131,0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #163c6e 0%, #256bb3 100%)",
    },
    "&.Mui-disabled": {
      color: "rgba(255,255,255,0.6)",
    },
  },

  outlinedButton: {
    borderRadius: "10px",
  },

  previewContainer: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    border: "1px solid #e0e0e0",
    height: "100%",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
  },
  previewHeader: {
    background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
    color: "#fff",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  previewAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  previewBody: {
    flex: 1,
    background:
      "#e5ddd5 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5cec4' fill-opacity='0.4'%3E%3Cpath d='M0 0h30v30H0zM30 30h30v30H30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: "8px",
  },
  previewMediaChip: {
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#DCF8C6",
    padding: "8px 10px",
    borderRadius: "10px 10px 2px 10px",
    fontSize: "12px",
    maxWidth: "85%",
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
  previewBubble: {
    alignSelf: "flex-end",
    background: "#DCF8C6",
    padding: "8px 10px",
    borderRadius: "10px 10px 2px 10px",
    maxWidth: "85%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
  previewText: {
    fontSize: "13.5px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#111",
  },
  previewMeta: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "3px",
    marginTop: "3px",
  },
  previewTime: {
    fontSize: "10px",
    color: "#667781",
  },
  previewEmpty: {
    color: "#8a8a8a",
    fontSize: "13px",
    fontStyle: "italic",
    textAlign: "center",
    margin: "auto",
    padding: "0 12px",
  },
}));

const PREVIEW_SAMPLE_VARIABLES = {
  nome: "João Silva",
  numero: "5511999999999",
  email: "joao.silva@email.com",
};

const buildPreviewText = (text) => {
  if (!text) return "";
  let preview = text;
  Object.entries(PREVIEW_SAMPLE_VARIABLES).forEach(([key, value]) => {
    preview = preview.replace(new RegExp(`\\{${key}\\}`, "gi"), value);
  });
  return preview;
};

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const CampaignModal = ({
  open,
  onClose,
  campaignId,
  initialValues,
  onSave,
  resetPagination,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    confirmationMessage1: "",
    confirmationMessage2: "",
    confirmationMessage3: "",
    confirmationMessage4: "",
    confirmationMessage5: "",
    status: "INATIVA", // INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA,
    confirmation: false,
    scheduledAt: "",
    //whatsappId: "",
    contactListId: "",
    tagListId: "Nenhuma",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapps, setSelectedWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api
        .get(`/contact-lists/list`, { params: { companyId } })
        .then(({ data }) => setContactLists(data));

      api
  		.get(`/whatsapp`, { params: { companyId, session: 0 } })
  		.then(({ data }) => {
    		// Mapear os dados recebidos da API para adicionar a propriedade 'selected'
    		const mappedWhatsapps = data.map((whatsapp) => ({
      		...whatsapp,
      		selected: false,
    	}));

        setWhatsapps(mappedWhatsapps);
      });

      api.get(`/tags`, { params: { companyId, kanban: 0 } })
      .then(({ data }) => {
        const fetchedTags = data.tags;
        // Perform any necessary data transformation here
        const formattedTagLists = fetchedTags.map((tag) => ({
          id: tag.id,
          name: tag.name,
        }));
        setTagLists(formattedTagLists);
      })
      .catch((error) => {
        console.error("Error retrieving tags:", error);
      });
      
      if (!campaignId) return;

      api.get(`/campaigns/${campaignId}`).then(({ data }) => {
        setCampaign((prev) => {
          let prevCampaignData = Object.assign({}, prev);

          Object.entries(data).forEach(([key, value]) => {
            if (key === "scheduledAt" && value !== "" && value !== null) {
              prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
            } else {
              prevCampaignData[key] = value === null ? "" : value;
            }
          });

          return prevCampaignData;
        });
      });
    }
  }, [campaignId, open, initialValues, companyId]);

  

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {
        ...values,  // Merge the existing values object
        whatsappId: selectedWhatsapps.join(","),
      };
    
      //console.log(values);
      //console.log(selectedWhatsapps);
    
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalizadas."
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const renderConfirmationMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const renderMessagePreview = (rawText) => {
    const previewText = buildPreviewText(rawText);
    const mediaName = attachment != null ? attachment.name : campaign.mediaName;
    const hasMedia = Boolean(attachment || campaign.mediaPath);

    return (
      <div className={classes.previewContainer}>
        <div className={classes.previewHeader}>
          <div className={classes.previewAvatar}>
            <PersonIcon style={{ fontSize: 18, color: "#fff" }} />
          </div>
          <div>
            <Typography style={{ fontSize: 13, fontWeight: 600 }}>
              {PREVIEW_SAMPLE_VARIABLES.nome}
            </Typography>
            <Typography style={{ fontSize: 10, opacity: 0.85 }}>
              Pré-visualização da mensagem
            </Typography>
          </div>
        </div>
        <div className={classes.previewBody}>
          {hasMedia && (
            <div className={classes.previewMediaChip}>
              <InsertDriveFileIcon style={{ fontSize: 16 }} />
              <span>{mediaName}</span>
            </div>
          )}
          {previewText ? (
            <div className={classes.previewBubble}>
              <Typography className={classes.previewText}>
                {previewText}
              </Typography>
              <div className={classes.previewMeta}>
                <Typography className={classes.previewTime}>
                  {moment().format("HH:mm")}
                </Typography>
                <DoneAllIcon style={{ fontSize: 14, color: "#53bdeb" }} />
              </div>
            </div>
          ) : (
            !hasMedia && (
              <Typography className={classes.previewEmpty}>
                Digite a mensagem ao lado para ver como ela vai aparecer para
                o contato.
              </Typography>
            )
          )}
        </div>
      </div>
    );
  };

  const renderMessageTabContent = (index, values) => {
    const identifier = `message${index}`;
    const confirmationIdentifier = `confirmationMessage${index}`;

    return (
      <Grid spacing={2} container>
        <Grid xs={12} md={7} item>
          {renderMessageField(identifier)}
          {values.confirmation && (
            <Box mt={2}>
              {renderConfirmationMessageField(confirmationIdentifier)}
            </Box>
          )}
        </Grid>
        <Grid xs={12} md={5} item>
          {renderMessagePreview(values[identifier])}
        </Grid>
      </Grid>
    );
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <div className={classes.dialogTitle} id="form-dialog-title">
          <div className={classes.dialogTitleLeft}>
            <div className={classes.dialogTitleIcon}>
              <CampaignIcon style={{ color: "#fff", fontSize: "22px" }} />
            </div>
            <Typography style={{ fontSize: "18px", fontWeight: 700 }}>
              {campaignEditable ? (
                <>
                  {campaignId
                    ? `${i18n.t("campaigns.dialog.update")}`
                    : `${i18n.t("campaigns.dialog.new")}`}
                </>
              ) : (
                <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
              )}
            </Typography>
          </div>
          <IconButton
            size="small"
            className={classes.closeButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Grid spacing={2} container>
                  <Grid xs={12} item>
                    <Typography className={classes.sectionTitle}>
                      Configurações da Campanha
                    </Typography>
                    <Divider className={classes.sectionDivider} />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="confirmation-selection-label">
                        {i18n.t("campaigns.dialog.form.confirmation")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.confirmation")}
                        placeholder={i18n.t(
                          "campaigns.dialog.form.confirmation"
                        )}
                        labelId="confirmation-selection-label"
                        id="confirmation"
                        name="confirmation"
                        error={
                          touched.confirmation && Boolean(errors.confirmation)
                        }
                        disabled={!campaignEditable}
                      >
                        <MenuItem value={false}>Desabilitada</MenuItem>
                        <MenuItem value={true}>Habilitada</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="contactList-selection-label">
                        {i18n.t("campaigns.dialog.form.contactList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.contactList")}
                        placeholder={i18n.t(
                          "campaigns.dialog.form.contactList"
                        )}
                        labelId="contactList-selection-label"
                        id="contactListId"
                        name="contactListId"
                        error={
                          touched.contactListId && Boolean(errors.contactListId)
                        }
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {contactLists &&
                          contactLists.map((contactList) => (
                            <MenuItem
                              key={contactList.id}
                              value={contactList.id}
                            >
                              {contactList.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                  <FormControl
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.formControl}
                  >
                    <InputLabel id="tagList-selection-label">
                      {i18n.t("campaigns.dialog.form.tagList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.tagList")}
                      placeholder={i18n.t("campaigns.dialog.form.tagList")}
                      labelId="tagList-selection-label"
                      id="tagListId"
                      name="tagListId"
                      error={touched.tagListId && Boolean(errors.tagListId)}
                      disabled={!campaignEditable}
                    >
                      {/* <MenuItem value="">Nenhuma</MenuItem> */}
                      {Array.isArray(tagLists) &&
                        tagLists.map((tagList) => (
                          <MenuItem key={tagList.id} value={tagList.id}>
                            {tagList.name}
                          </MenuItem>
                        ))}
                    </Field>
                  </FormControl>
                </Grid>

<Grid xs={12} md={4} item>
  <FormControl
    variant="outlined"
    margin="dense"
    fullWidth
    className={classes.formControl}
  >
    <InputLabel id="whatsapp-selection-label">
      {i18n.t("campaigns.dialog.form.whatsapp")}
    </InputLabel>
    <Field
      as={Select}
      multiple 
      label={i18n.t("campaigns.dialog.form.whatsapp")}
      placeholder={i18n.t("campaigns.dialog.form.whatsapp")}
      labelId="whatsapp-selection-label"
      id="whatsappIds"
      name="whatsappIds"
      required
      error={touched.whatsappId && Boolean(errors.whatsappId)}
      disabled={!campaignEditable}
      value={selectedWhatsapps}  
      onChange={(event) => setSelectedWhatsapps(event.target.value)} 
      renderValue={(selected) => (
        <div>
          {selected.map((value) => (
            <Chip key={value} label={whatsapps.find((whatsapp) => whatsapp.id === value).name} />
          ))}
        </div>
      )}
    >
      {whatsapps &&
        whatsapps.map((whatsapp) => (
          <MenuItem key={whatsapp.id} value={whatsapp.id}>
            {whatsapp.name}
          </MenuItem>
        ))}
    </Field>
  </FormControl>
</Grid>

                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      margin="dense"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} item>
                    <Typography className={classes.sectionTitle} style={{ marginTop: "12px" }}>
                      Mensagens da Campanha
                    </Typography>
                    <Divider className={classes.sectionDivider} />
                    <Tabs
                      className={classes.tabs}
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      onChange={(e, v) => setMessageTab(v)}
                      variant="fullWidth"
                      centered
                    >
                      <Tab label="Msg. 1" index={0} />
                      <Tab label="Msg. 2" index={1} />
                      <Tab label="Msg. 3" index={2} />
                      <Tab label="Msg. 4" index={3} />
                      <Tab label="Msg. 5" index={4} />
                    </Tabs>
                    <Box style={{ paddingTop: 20, border: "none" }}>
                      {messageTab === 0 && renderMessageTabContent(1, values)}
                      {messageTab === 1 && renderMessageTabContent(2, values)}
                      {messageTab === 2 && renderMessageTabContent(3, values)}
                      {messageTab === 3 && renderMessageTabContent(4, values)}
                      {messageTab === 4 && renderMessageTabContent(5, values)}
                    </Box>
                  </Grid>
                  {(campaign.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Button startIcon={<AttachFileIcon />}>
                        {attachment != null
                          ? attachment.name
                          : campaign.mediaName}
                      </Button>
                      {campaignEditable && (
                        <IconButton
                          onClick={() => setConfirmationOpen(true)}
                          color="primary"
                        >
                          <DeleteOutlineIcon color="secondary" />
                        </IconButton>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions style={{ padding: "16px 24px" }}>
                {campaign.status === "CANCELADA" && (
                  <Button
                    className={classes.outlinedButton}
                    color="primary"
                    onClick={() => restartCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}
                {campaign.status === "EM_ANDAMENTO" && (
                  <Button
                    className={classes.outlinedButton}
                    color="primary"
                    onClick={() => cancelCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}
                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    className={classes.outlinedButton}
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  className={classes.outlinedButton}
                  onClick={handleClose}
                  color="primary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    className={`${classes.btnWrapper} ${classes.submitButton}`}
                  >
                    {campaignId
                      ? `${i18n.t("campaigns.dialog.buttons.edit")}`
                      : `${i18n.t("campaigns.dialog.buttons.add")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;