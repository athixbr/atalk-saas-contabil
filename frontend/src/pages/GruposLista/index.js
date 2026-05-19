import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import RefreshIcon from "@material-ui/icons/Refresh";
import Avatar from "@material-ui/core/Avatar";
import GroupIcon from "@material-ui/icons/Group";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Grid, Chip, Typography } from "@material-ui/core";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getBackendUrl } from "../../config";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.padding,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  groupAvatar: {
    width: 40,
    height: 40,
  },
}));

const GruposLista = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const backendUrl = getBackendUrl();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (searchParam === "") {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(searchParam.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchParam, groups]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp-groups");
      setGroups(data.groups || []);
      setFilteredGroups(data.groups || []);
      toast.success(`${data.groups?.length || 0} grupos carregados!`);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchParam(event.target.value);
  };

  const handleRefresh = () => {
    fetchGroups();
  };

  return (
    <MainContainer>
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>Lista de Grupos WhatsApp</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={12} item>
                <TextField
                  fullWidth
                  placeholder="Buscar grupo..."
                  type="search"
                  value={searchParam}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Grid container spacing={2} style={{ marginBottom: 16 }}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Atualizar Lista
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Total: {filteredGroups.length} grupos
            </Typography>
          </Grid>
        </Grid>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Foto</TableCell>
              <TableCell align="left">Nome do Grupo</TableCell>
              <TableCell align="center">ID do Grupo</TableCell>
              <TableCell align="center">Participantes</TableCell>
              <TableCell align="center">Conexão</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell align="center">
                    {group.profilePicUrl ? (
                      <Avatar
                        src={group.profilePicUrl}
                        className={classes.groupAvatar}
                      />
                    ) : (
                      <Avatar className={classes.groupAvatar}>
                        <GroupIcon />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell align="left">{group.name}</TableCell>
                  <TableCell align="center">
                    <Typography variant="caption">{group.groupId}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${group.participantsCount || 0} membros`}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={group.whatsappName} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={5} />}
              {!loading && filteredGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum grupo encontrado. Clique em "Atualizar Lista" para
                      buscar os grupos.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default GruposLista;
