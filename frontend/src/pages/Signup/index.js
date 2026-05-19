import { Lock, Mail, Person, Phone, Business, Visibility, VisibilityOff } from "@mui/icons-material";
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
import { Field, Form, Formik } from "formik";
import React, { useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import logo from "../../assets/logo1.png";
import toastError from "../../errors/toastError";
import ColorModeContext from "../../layout/themeContext";
import { openApi } from "../../services/api";

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

const SignUpContainer = styled(Box)(({ theme }) => ({
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
  overflowY: "auto",
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

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  email: Yup.string().email("Email inválido").required("Obrigatório"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Obrigatório"),
  phone: Yup.string().required("Obrigatório"),
  companyName: Yup.string().required("Obrigatório"),
});

const Signup = () => {
  const { colorMode } = useContext(ColorModeContext);
  const { appName } = colorMode;
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      title: "Comece Agora",
      description: "Cadastre-se e transforme sua gestão"
    },
    {
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      title: "Fácil e Rápido",
      description: "Configure sua conta em minutos"
    },
    {
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
      title: "Sem Compromisso",
      description: "Experimente todas as funcionalidades"
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

  const handleSignUp = async (values) => {
    try {
      await openApi.post("/auth/signup", values);
      toast.success("Cadastro realizado com sucesso! Faça login.");
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastre-se - {appName || "Atalk"}</title>
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <CssBaseline enableColorScheme />
      <SignUpContainer>
        <LeftSection>
          <Box sx={{ width: "100%", maxWidth: "500px" }}>
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
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#2d3748",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Criar Conta
                </Typography>
                <Typography variant="body1" sx={{ color: "#718096" }}>
                  Preencha os dados abaixo para começar
                </Typography>
              </Box>

              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  companyName: "",
                }}
                validationSchema={SignupSchema}
                onSubmit={handleSignUp}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form style={{ width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <FormControl>
                        <StyledFormLabel>Nome Completo</StyledFormLabel>
                        <Field
                          as={StyledTextField}
                          name="name"
                          placeholder="Seu nome completo"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <StyledFormLabel>E-mail</StyledFormLabel>
                        <Field
                          as={StyledTextField}
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
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

                      <FormControl>
                        <StyledFormLabel>Senha</StyledFormLabel>
                        <Field
                          as={StyledTextField}
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
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

                      <FormControl>
                        <StyledFormLabel>Telefone</StyledFormLabel>
                        <Field
                          as={StyledTextField}
                          name="phone"
                          placeholder="(00) 00000-0000"
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <StyledFormLabel>Nome da Empresa</StyledFormLabel>
                        <Field
                          as={StyledTextField}
                          name="companyName"
                          placeholder="Nome da sua empresa"
                          error={touched.companyName && Boolean(errors.companyName)}
                          helperText={touched.companyName && errors.companyName}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
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
                        {isSubmitting ? "Cadastrando..." : "Criar Conta"}
                      </Button>

                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography sx={{ color: "#718096" }}>
                          Já tem uma conta?{" "}
                          <StyledLink href="/login">
                            Faça login →
                          </StyledLink>
                        </Typography>
                      </Box>
                    </Box>
                  </Form>
                )}
              </Formik>
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
      </SignUpContainer>
    </>
  );
};

export default Signup;
