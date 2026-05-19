import React, { useState } from "react";
import { Button, Menu, MenuItem, CircularProgress } from "@material-ui/core";
import { GetApp as GetAppIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const ExportButton = ({ vinculos, loading }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const calcularDiasRestantes = (dataFim) => {
    if (!dataFim) return null;
    return differenceInDays(parseISO(dataFim), new Date());
  };

  const getStatusText = (vinculo) => {
    if (!vinculo.ativo) return "Inativo";
    if (!vinculo.dataFim) return "Ativo";

    const dias = calcularDiasRestantes(vinculo.dataFim);
    if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
    if (dias <= 30) return `Vence em ${dias} dias`;
    return "Ativo";
  };

  const exportToExcel = () => {
    try {
      setExporting(true);

      const dados = vinculos.map((v) => ({
        "Controle": `${v.controleConfig?.codigo || ""} - ${v.controleConfig?.nome || ""}`,
        "Cliente": v.cliente?.nome || "",
        "CNPJ/CPF": v.cliente?.cnpj || v.cliente?.cpf || "",
        "Data Início": v.dataInicio
          ? format(parseISO(v.dataInicio), "dd/MM/yyyy", { locale: ptBR })
          : "",
        "Data Fim": v.dataFim
          ? format(parseISO(v.dataFim), "dd/MM/yyyy", { locale: ptBR })
          : "Indeterminado",
        "Dias Restantes": calcularDiasRestantes(v.dataFim) ?? "",
        "Status": getStatusText(v),
        "Departamento": v.departamento?.nome || "",
        "Usuário": v.usuario?.name || "",
        "Observações": v.observacoes || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Controles Vinculados");

      // Ajustar largura das colunas
      const maxWidth = dados.reduce((acc, row) => {
        Object.keys(row).forEach((key, i) => {
          const cellValue = String(row[key] || "");
          acc[i] = Math.max(acc[i] || 10, cellValue.length);
        });
        return acc;
      }, []);

      worksheet["!cols"] = maxWidth.map((w) => ({ wch: Math.min(w + 2, 50) }));

      const dataAtual = format(new Date(), "yyyyMMdd_HHmmss");
      XLSX.writeFile(workbook, `controles_vinculados_${dataAtual}.xlsx`);

      toast.success("Exportação para Excel concluída!");
      handleClose();
    } catch (err) {
      console.error("Erro ao exportar para Excel:", err);
      toast.error("Erro ao exportar para Excel");
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setExporting(true);

      // Gerar CSV ao invés de PDF (mais compatível)
      const dados = vinculos.map((v) => ({
        "Controle": `${v.controleConfig?.codigo || ""} - ${v.controleConfig?.nome || ""}`,
        "Cliente": v.cliente?.nome || "",
        "CNPJ/CPF": v.cliente?.cnpj || v.cliente?.cpf || "",
        "Data Início": v.dataInicio
          ? format(parseISO(v.dataInicio), "dd/MM/yyyy", { locale: ptBR })
          : "",
        "Data Fim": v.dataFim
          ? format(parseISO(v.dataFim), "dd/MM/yyyy", { locale: ptBR })
          : "Indeterminado",
        "Dias Restantes": calcularDiasRestantes(v.dataFim) ?? "",
        "Status": getStatusText(v),
        "Departamento": v.departamento?.nome || "",
        "Usuário": v.usuario?.name || "",
        "Observações": v.observacoes || "",
      }));

      // Converter para CSV
      const worksheet = XLSX.utils.json_to_sheet(dados);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // Criar blob e download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      const dataAtual = format(new Date(), "yyyyMMdd_HHmmss");
      link.setAttribute("download", `controles_vinculados_${dataAtual}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exportação para CSV concluída!");
      handleClose();
    } catch (err) {
      console.error("Erro ao exportar:", err);
      toast.error("Erro ao exportar arquivo");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={exporting ? <CircularProgress size={20} /> : <GetAppIcon />}
        onClick={handleClick}
        disabled={loading || exporting || vinculos.length === 0}
      >
        Exportar
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={exportToExcel}>Exportar para Excel</MenuItem>
        <MenuItem onClick={exportToPDF}>Exportar para CSV</MenuItem>
      </Menu>
    </>
  );
};

export default ExportButton;
