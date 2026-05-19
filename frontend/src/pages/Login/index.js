import { Lock, Mail } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import logo from "../../assets/logo1.png";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";

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

const SignInContainer = styled(Box)(({ theme }) => ({
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

const Login = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const { colorMode } = useContext(ColorModeContext);
  const { appName } = colorMode;
  const [user, setUser] = useState({ email: "", password: "" });
  const [allowSignup, setAllowSignup] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { handleLogin } = useContext(AuthContext);

  // Imagens do carrossel
  const images = [
    { 
      url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      title: "Gestão Empresarial Inteligente",
      description: "Transforme sua forma de trabalhar"
    },
    { 
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      title: "Comunicação Eficiente",
      description: "Conecte sua equipe em tempo real"
    },
    { 
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
      title: "Produtividade Elevada",
      description: "Otimize seus processos e resultados"
    },
  ];

  // Trocar imagem automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Por favor, insira um email válido.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <>
      <Helmet>
        <title>{appName || "Atalk"}</title>
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <CssBaseline enableColorScheme />
      <SignInContainer>
        {/* Seção Esquerda - Formulário */}
        <LeftSection>
          <Box sx={{ width: "100%", maxWidth: "450px" }}>
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 4,
              }}
            >
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
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#2d3748",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Bem-vindo de volta!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#718096" }}
                >
                  Acesse sua conta para continuar
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handlSubmit}
                noValidate
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: 2.5,
                }}
              >
                <FormControl>
                  <StyledFormLabel htmlFor="email">E-mail</StyledFormLabel>
                  <StyledTextField
                    error={emailError}
                    helperText={emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    onChange={handleChangeInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail sx={{ color: "#667eea" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <StyledFormLabel htmlFor="password">Senha</StyledFormLabel>
                    <StyledLink href="/recovery-password" variant="body2">
                      Esqueceu a senha?
                    </StyledLink>
                  </Box>
                  <StyledTextField
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    required
                    fullWidth
                    onChange={handleChangeInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "#667eea" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={validateInputs}
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
                  Entrar
                </Button>

                {!allowSignup && (
                  <>
                    <Divider sx={{ my: 2 }}>
                      <Typography sx={{ color: "#a0aec0", fontSize: "0.875rem" }}>
                        ou
                      </Typography>
                    </Divider>

                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2.5,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#2d3748",
                          mb: 0.5,
                          fontWeight: 500,
                        }}
                      >
                        Novo por aqui?
                      </Typography>
                      <Typography sx={{ color: "#718096" }}>
                        Crie sua conta e comece agora
                        <StyledLink
                          href="/signup"
                          sx={{
                            display: "inline-block",
                            ml: 1,
                            fontWeight: 600,
                          }}
                        >
                          Cadastre-se →
                        </StyledLink>
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Box>
        </LeftSection>

        {/* Seção Direita - Carrossel de Imagens */}
        <RightSection>
          {images.map((image, index) => (
            <ImageSlide
              key={index}
              sx={{
                opacity: currentImageIndex === index ? 1 : 0,
                zIndex: currentImageIndex === index ? 1 : 0,
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  color: "#ffffff",
                  maxWidth: "600px",
                }}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    marginBottom: "40px",
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {image.title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  {image.description}
                </Typography>
              </Box>
            </ImageSlide>
          ))}
          
          {/* Indicadores do carrossel */}
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

        {/* Rodapé */}
        <Footer>
          <Typography variant="body2">
            Desenvolvido por <strong>IRYD</strong>
          </Typography>
        </Footer>
      </SignInContainer>
    </>
  );
};

export default Login;
