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

const getLastDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getFirstDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const ChartsDate = () => {
  const [initialDate, setInitialDate] = useState(getFirstDayOfMonth(new Date()));
  const [finalDate, setFinalDate] = useState(getLastDayOfMonth(new Date()));
  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });

  useEffect(() => {
    handleGetTicketsInformation();
  }, [initialDate, finalDate]);

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await api.get(
        `/dashboard/total-atendimentos?initialDate=${format(initialDate, "yyyy-MM-dd")}&finalDate=${format(finalDate, "yyyy-MM-dd")}`
      );
      setTicketsData(data);
    } catch (_) {
      toast.error("Erro ao buscar evolução dos atendimentos");
    }
  };

  const labels =
    ticketsData?.data?.length > 0
      ? ticketsData.data.map((item) =>
          item.hasOwnProperty("horario")
            ? `${item.horario}h`
            : item.data
        )
      : [];

  const values =
    ticketsData?.data?.length > 0
      ? ticketsData.data.map((item) => item.total)
      : [];

  const dataCharts = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        backgroundColor: "rgba(26,71,131,0.85)",
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: "#2d7dd2",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} atendimento(s)`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 45 },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          label={`Total: ${ticketsData?.count ?? 0}`}
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
