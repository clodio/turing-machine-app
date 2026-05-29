import ContentIcon from "@mui/icons-material/ContentPasteRounded";
import SearchIcon from "@mui/icons-material/ContentPasteSearchRounded";
import DarkModeIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightModeRounded";
import SaveIcon from "@mui/icons-material/SaveRounded";
import CheckIcon from "@mui/icons-material/RuleFolderRounded";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import { ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { usePaletteMode } from "hooks/usePaletteMode";
import { FC, useState } from "react";
import { useUpdateEffect } from "react-use";
import { savesActions } from "store/slices/savesSlice";
import Comments from "./Comments";
import DigitCode from "./DigitCode";
import Registration from "./Registration";
import Rounds from "./Rounds";
import Saves from "./Saves";
import { checkDeductions, getFinalCodesFromCheckCards } from "deductions";
import LanguageSelect from "components/LanguageSelect";
import { NewButton } from "components/NewButton";
import { settingsActions } from "store/slices/settingsSlice";
import { alertActions } from "store/slices/alertSlice";
import { useCanBeSaved } from "hooks/useCanBeSaved";
import { PossibleCodes } from "components/PossibleCodes";
import { ManualCodeList } from "../components/ManualCodeList";
import ShapeIcon from "components/ShapeIcon";

const Root: FC = () => {
  const { theme, togglePaletteMode } = usePaletteMode();
  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));
  const isUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const language = useAppSelector((state) => state.settings.language);

  const [savesDialog, setSavesDialog] = useState(false);
  const [hasBadge, setHasBadge] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [showSolutionDialog, setShowSolutionDialog] = useState(false);
  const [solutionCode, setSolutionCode] = useState<string | null>(null);

  useUpdateEffect(() => {
    state.saves.length === 0 && setSavesDialog(false);
  }, [state.saves]);

  const onConfirmShowSolution = async () => {
    setShowSolutionConfirm(false);
    const result = getFinalCodesFromCheckCards(state);
    if (!result?.codes?.length) {
      dispatch(
        alertActions.openAlert({
          message: "Aucune solution ne peut etre affichee avec les informations actuelles.",
          level: "warning",
        })
      );
      return;
    }
    setSolutionCode(result.codes[0]);
    setShowSolutionDialog(true);
  };

  const canBeSaved = useCanBeSaved();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Toast global — fixed, indépendant du layout */}
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        open={state.alert.open}
        autoHideDuration={3000}
        onClose={() => dispatch(alertActions.closeAlert())}
      >
        <Alert
          onClose={() => dispatch(alertActions.closeAlert())}
          severity={state.alert.level}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {state.alert.message}
        </Alert>
      </Snackbar>

      {/*
        Header : logo + titre + barre de boutons.
        Tout reste dans le flux normal (pas de position absolute sur les boutons)
        pour éviter le débordement horizontal.
      */}
      <Box
        textAlign="center"
        margin="auto"
        mb={4}
        sx={{ maxWidth: 480, px: 1 }}
      >
        {/* Logo */}
        <Box position="relative" width={320} margin="auto" mb={3}>
          <img
            src={process.env.PUBLIC_URL + "/assets/logo.png"}
            alt="logo"
            style={{ width: 320 }}
          />
          <Box
            sx={{
              background: theme.palette.background.paper,
              position: "absolute",
              bottom: theme.spacing(-3),
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <h3
              style={{
                margin: theme.spacing(-0.25, 0, 0),
                transform: "rotate(-2deg)",
              }}
            >
              Interactive Sheet
            </h3>
          </Box>
        </Box>

      </Box>

      {/* Barre de boutons sticky au niveau page pour rester visible pendant le scroll */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.appBar,
          background: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          data-id="header-buttons"
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          gap={0.5}
          mt={1}
          sx={{
            maxWidth: 480,
            mx: "auto",
            px: 1,
            py: 0.5,
            background: theme.palette.background.paper,
          }}
        >
          <IconButton
            aria-label="check"
            disabled={state.registration.status !== "ready"}
            sx={{ position: "relative", color: theme.palette.primary.dark }}
            onClick={() => {
              checkDeductions(state);
            }}
          >
            <ContentIcon />
            <Box
              sx={{
                background: theme.palette.background.default,
                width: theme.spacing(2),
                height: theme.spacing(2),
                bottom: 8,
                position: "absolute",
                right: 8,
              }}
            >
              <CheckIcon
                fontSize="small"
                sx={{
                  position: "absolute",
                  right: -4,
                  bottom: -3,
                  fontSize: 18,
                }}
              />
            </Box>
          </IconButton>
          <Divider
            orientation="vertical"
            sx={{ height: "auto", margin: theme.spacing(0, 0.5) }}
          />
          <NewButton />
          <IconButton
            aria-label="save"
            color="primary"
            disabled={state.registration.status !== "ready" || !canBeSaved}
            onClick={() => {
              state.registration.hash && setHasBadge(true);
              dispatch(savesActions.save({ ...state, date: Date.now() }));
            }}
            sx={{ position: "relative" }}
          >
            <ContentIcon />
            <Box
              sx={{
                background: theme.palette.background.default,
                width: theme.spacing(2),
                height: theme.spacing(2),
                bottom: 8,
                position: "absolute",
                right: 8,
              }}
            >
              <SaveIcon
                fontSize="small"
                sx={{
                  position: "absolute",
                  right: -3,
                  bottom: -3,
                  fontSize: 18,
                }}
              />
            </Box>
          </IconButton>
          <IconButton
            aria-label="saves"
            disabled={state.saves.length === 0}
            color="primary"
            onClick={() => {
              setHasBadge(false);
              setSavesDialog(!savesDialog);
            }}
          >
            <Badge variant="dot" color="secondary" invisible={!hasBadge}>
              <SearchIcon />
            </Badge>
          </IconButton>
          <Divider
            orientation="vertical"
            sx={{ height: "auto", margin: theme.spacing(0, 0.5) }}
          />
          <LanguageSelect
            value={language}
            disabled={false}
            prefixId="settings__lang"
            onChange={(value) => dispatch(settingsActions.updateLanguage(value))}
          />
          <Divider
            orientation="vertical"
            sx={{ height: "auto", margin: theme.spacing(0, 0.5) }}
          />
          <IconButton
            aria-label="toggle palette mode"
            onClick={togglePaletteMode}
          >
            {theme.palette.mode === "light" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      <Registration />
      <Container sx={{ maxWidth: isUpMd ? 704 : undefined }}>
        <Collapse in={state.registration.status === "ready"}>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item lg={3} md={6} xs={12}>
              <Rounds />
            </Grid>
            <Grid item lg={6} md={6} xs={12}>
              {isUpLg ? (
                <>
                  <ManualCodeList />
                  <Comments />
                </>
              ) : (
                <DigitCode />
              )}
            </Grid>
            <Grid item lg={3} xs={12}>
              {isUpLg ? (
                <DigitCode />
              ) : (
                <>
                  <ManualCodeList />
                  <Comments />
                </>
              )}
              <PossibleCodes />
            </Grid>
          </Grid>
        </Collapse>
      </Container>
      <Saves
        isOpen={savesDialog}
        onClose={() => {
          setSavesDialog(false);
        }}
        onLoad={() => {
          setSavesDialog(false);
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          disabled={state.registration.status !== "ready"}
          onClick={() => setShowSolutionConfirm(true)}
        >
          Afficher la solution
        </Button>
      </Box>

      <Dialog
        open={showSolutionConfirm}
        onClose={() => setShowSolutionConfirm(false)}
      >
        <DialogTitle>Etes vous sur de vouloir voir la solution ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setShowSolutionConfirm(false)}>Non</Button>
          <Button variant="contained" color="error" onClick={onConfirmShowSolution}>
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSolutionDialog} onClose={() => setShowSolutionDialog(false)}>
        <DialogTitle>Code secret</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1.5} mt={0.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ShapeIcon shape="triangle" sizeMultiplier={0.8} />
              <Typography sx={{ color: "#57b3da", fontWeight: 700 }}>
                Bleu: {solutionCode?.[0]}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ShapeIcon shape="square" sizeMultiplier={0.8} />
              <Typography sx={{ color: "#ffbb10", fontWeight: 700 }}>
                Jaune: {solutionCode?.[1]}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ShapeIcon shape="circle" sizeMultiplier={0.8} />
              <Typography sx={{ color: "#7f66ad", fontWeight: 700 }}>
                Violet: {solutionCode?.[2]}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSolutionDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Root;
