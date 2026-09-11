import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Stack, TextField, Chip, Box } from "@mui/material";
import Typography from "@material-ui/core/Typography";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const CHART_COLORS = [
  "#1A4783", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6",
  "#1ABC9C", "#E67E22", "#3498DB", "#E91E63", "#00BCD4",
  "#8BC34A", "#FF5722", "#607D8B", "#009688", "#FF9800",
  "#673AB7", "#795548", "#00ACC1", "#F06292", "#AED581",
];

const getLastDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getFirstDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const ChartsUser = () => {
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [ticketsData, setTicketsData] = useState({ data: [] });

  useEffect(() => {
    handleGetTicketsInformation();
  }, [initialDate, finalDate]);

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await api.get(
        `/dashboard/ticketsUsers?initialDate=${format(initialDate, "yyyy-MM-dd")}&finalDate=${format(finalDate, "yyyy-MM-dd")}`
      );
      setTicketsData(data);
    } catch (_) {
      toast.error("Erro ao buscar informações por usuário");
    }
  };

  const labels = ticketsData?.data?.length > 0 ? ticketsData.data.map((i) => i.nome) : [];
  const values = ticketsData?.data?.length > 0 ? ticketsData.data.map((i) => i.quantidade) : [];
  const total = values.reduce((s, v) => s + v, 0);

  const dataCharts = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.label}: ${ctx.parsed} (${total > 0 ? Math.round((ctx.parsed / total) * 100) : 0}%)`,
        },
      },
      datalabels: {
        display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
        color: "#fff",
        font: { weight: "bold", size: 10 },
        formatter: (value) => value,
      },
    },
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          label={`Total: ${total}`}
          size="small"
          sx={{ background: "#1A4783", color: "#fff", fontWeight: 600, fontSize: "12px" }}
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={initialDate}
            onChange={(v) => setInitialDate(v)}
            label="Data inicial"
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{ width: "18ch" }} />
            )}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={finalDate}
            onChange={(v) => setFinalDate(v)}
            label="Data final"
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{ width: "18ch" }} />
            )}
          />
        </LocalizationProvider>
      </Stack>

      {labels.length === 0 ? (
        <Typography
          style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: "14px" }}
        >
          Sem dados para o período selecionado
        </Typography>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Doughnut
            options={options}
            data={dataCharts}
            plugins={[ChartDataLabels]}
            style={{ maxWidth: "100%", maxHeight: "280px" }}
          />
        </Box>
      )}
    </>
  );
};
