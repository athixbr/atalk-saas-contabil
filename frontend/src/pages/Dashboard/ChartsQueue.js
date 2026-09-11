import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Stack, TextField, Chip } from "@mui/material";
import Typography from "@material-ui/core/Typography";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BAR_COLORS = [
  "#1A4783", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6",
  "#1ABC9C", "#E67E22", "#3498DB", "#E91E63", "#00BCD4",
  "#8BC34A", "#FF5722", "#607D8B", "#009688", "#FF9800",
];

const getLastDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getFirstDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const ChartsQueue = () => {
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [ticketsData, setTicketsData] = useState([]);

  useEffect(() => {
    handleGetTicketsInformation();
  }, [initialDate, finalDate]);

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await api.get(
        `/dashboard/queues?initialDate=${format(initialDate, "yyyy-MM-dd")}&finalDate=${format(finalDate, "yyyy-MM-dd")}`
      );
      setTicketsData(data);
    } catch (_) {
      toast.error("Erro ao buscar informações por fila");
    }
  };

  const labels =
    ticketsData && ticketsData.length > 0
      ? ticketsData.map((item) => item?.queue?.name || "Sem fila")
      : [];

  const values =
    ticketsData && ticketsData.length > 0
      ? ticketsData.map((item) => item.quantidade)
      : [];

  const dataCharts = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        backgroundColor: labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x} atendimento(s)`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const total = values.reduce((s, v) => s + v, 0);

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
        <Bar
          options={options}
          data={dataCharts}
          style={{ maxWidth: "100%", maxHeight: "300px" }}
        />
      )}
    </>
  );
};
