import { Lock, Mail, Visibility, VisibilityOff } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/logo1.png";
import toastError from "../../errors/toastError";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  borderRadius: "20px",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  background: "#ffffff",
  border: "none",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5),
  },
}));

const ResetContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  position: "relative",
  background: "#f8f9fa",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
  background: "#ffffff",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(8),
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "none",
  position: "relative",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const ImageSlide = styled(Box)({
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 1s ease-in-out",
  padding: "60px",
  "& img": {
    maxWidth: "100%",
    maxHeight: "80%",
    objectFit: "contain",
  },
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: "#667eea",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#667eea",
    },
  },
  "& .MuiInputBase-input": {
    color: "#2d3748",
    paddingLeft: "10px",
  },
  "& .MuiInputLabel-root": {
    color: "#718096",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#667eea",
  },
}));

const StyledFormLabel = styled(FormLabel)({
  color: "#2d3748",
  marginBottom: "8px",
  fontWeight: 500,
});

const StyledLink = styled(Link)({
  color: "#667eea",
  textDecoration: "none",
  fontWeight: 500,
  "&:hover": {
    color: "#764ba2",
    textDecoration: "underline",
  },
});

const Footer = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
  padding: theme.spacing(2),
  textAlign: "center",
  background: "transparent",
  color: "#718096",
  fontSize: "0.875rem",
  zIndex: 10,
}));

const PasswordReset = () => {
  const { colorMode } = useContext(ColorModeContext);
  const { appName } = colorMode;
  const history = useHistory();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState(1); // 1: telefone, 2: código, 3: nova senha
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      title: "Recupere seu Acesso",
      description: "Redefina sua senha em poucos passos"
    },
    {
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      title: "Segurança em Primeiro Lugar",
      description: "Processo seguro de verificação"
    },
    {
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
      title: "Rápido e Fácil",
      description: "Volte a usar sua conta rapidamente"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendPhone = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Digite seu WhatsApp");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/enviar-email", { wpp: phone });
      setUserId(data.userId);
      setStep(2);
      toast.success("Código de verificação enviado para seu WhatsApp!");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Digite o código de verificação");
      return;
    }

    try {
      setLoading(true);
      // Formatar número antes de verificar
      const formattedPhone = phone.replace(/\D/g, '');
      const finalPhone = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
      
      const { data } = await api.get(`/api/verificar-code/${finalPhone}`);
      
      if (data.code === verificationCode) {
        setStep(3);
        toast.success("Código verificado! Agora defina sua nova senha.");
      } else {
        toast.error("Código incorreto");
      }
    } catch (err) {
      toast.error("Código incorreto ou expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      await api.put("/api/atualizar-senha", { 
        userId, 
        newPassword 
      });
      toast.success("Senha alterada com sucesso!");
      history.push("/login");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ color: "#2d3748", fontWeight: 700, mb: 1 }}>
                Esqueceu sua senha?
              </Typography>
              <Typography variant="body1" sx={{ color: "#718096" }}>
                Digite seu WhatsApp para receber o código de verificação
              </Typography>
            </Box>

            <form onSubmit={handleSendPhone} style={{ width: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <FormControl>
                  <StyledFormLabel>WhatsApp</StyledFormLabel>
                  <StyledTextField
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail sx={{ color: "#667eea" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: "12px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                  endIcon={<SendIcon />}
                >
                  {loading ? "Enviando..." : "Enviar Código"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography sx={{ color: "#718096" }}>
                    Lembrou sua senha?{" "}
                    <StyledLink href="/login">
                      Fazer login →
                    </StyledLink>
                  </Typography>
                </Box>
              </Box>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ color: "#2d3748", fontWeight: 700, mb: 1 }}>
                Verificar Código
              </Typography>
              <Typography variant="body1" sx={{ color: "#718096" }}>
                Digite o código enviado para o WhatsApp {phone}
              </Typography>
            </Box>

            <form onSubmit={handleVerifyCode} style={{ width: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <FormControl>
                  <StyledFormLabel>Código de Verificação</StyledFormLabel>
                  <StyledTextField
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    fullWidth
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: "12px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                  endIcon={<SendIcon />}
                >
                  {loading ? "Verificando..." : "Verificar Código"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography sx={{ color: "#718096" }}>
                    <StyledLink href="#" onClick={() => setStep(1)}>
                      ← Voltar
                    </StyledLink>
                  </Typography>
                </Box>
              </Box>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ color: "#2d3748", fontWeight: 700, mb: 1 }}>
                Nova Senha
              </Typography>
              <Typography variant="body1" sx={{ color: "#718096" }}>
                Digite sua nova senha
              </Typography>
            </Box>

            <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <FormControl>
                  <StyledFormLabel>Nova Senha</StyledFormLabel>
                  <StyledTextField
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "#667eea" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: "12px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                  endIcon={<SendIcon />}
                >
                  {loading ? "Alterando..." : "Alterar Senha"}
                </Button>
              </Box>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Senha - {appName || "Atalk"}</title>
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <CssBaseline enableColorScheme />
      <ResetContainer>
        <LeftSection>
          <Box sx={{ width: "100%", maxWidth: "450px" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "180px",
                  height: "auto",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
                }}
              />
            </Box>

            <Card elevation={0}>
              {getStepContent()}
            </Card>
          </Box>
        </LeftSection>

        <RightSection>
          {images.map((image, index) => (
            <ImageSlide
              key={index}
              sx={{
                opacity: currentImageIndex === index ? 1 : 0,
                zIndex: currentImageIndex === index ? 1 : 0,
              }}
            >
              <Box sx={{ textAlign: "center", color: "#ffffff", maxWidth: "600px" }}>
                <img
                  src={image.url}
                  alt={image.title}
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    marginBottom: "40px",
                  }}
                />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)" }}>
                  {image.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9 }}>
                  {image.description}
                </Typography>
              </Box>
            </ImageSlide>
          ))}

          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              zIndex: 2,
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: currentImageIndex === index ? 30 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: currentImageIndex === index ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </Box>
        </RightSection>

        <Footer>
          <Typography variant="body2">
            Desenvolvido por <strong>IRYD</strong>
          </Typography>
        </Footer>
      </ResetContainer>
    </>
  );
};

export default PasswordReset;
