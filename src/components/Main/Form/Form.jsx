import React, { useState, useContext, useEffect, useRef } from "react";
import {
  TextField,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";

import Snackbar from "../../Snackbar/Snackbar";
import formatDate from "../../../utils/formatDate";
import { ExpenseTrackerContext } from "../../../context/context";
import { incomeCategories, expenseCategories } from "../../../constants/categories";
import useStyles from "./styles";

const initialState = {
  amount: "",
  category: "",
  type: "Income",
  date: formatDate(new Date()),
};

const NewTransactionForm = () => {
  const classes = useStyles();
  const { addTransaction } = useContext(ExpenseTrackerContext);
  const [formData, setFormData] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef(null);

  // ✅ Initialize recognition ONCE
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);

        // ✅ Update formData safely
        setFormData((prev) => {
          let updated = { ...prev };

          if (text.toLowerCase().includes("income")) {
            updated.type = "Income";
          } else if (text.toLowerCase().includes("expense")) {
            updated.type = "Expense";
          }

          const amountMatch = text.match(/\d+/);
          if (amountMatch) {
            updated.amount = amountMatch[0];
          }

          const allCategories = [
            ...incomeCategories.map((c) => c.type.toLowerCase()),
            ...expenseCategories.map((c) => c.type.toLowerCase()),
          ];
          const foundCategory = allCategories.find((cat) =>
            text.toLowerCase().includes(cat)
          );
          if (foundCategory) {
            updated.category =
              foundCategory.charAt(0).toUpperCase() + foundCategory.slice(1);
          }

          if (text.toLowerCase().includes("today")) {
            updated.date = formatDate(new Date());
          }

          return updated;
        });
      };

      recognitionRef.current = recognition;
    } else {
      alert("Sorry, your browser does not support Speech Recognition.");
    }
  }, []); // ✅ run only once

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const createTransaction = () => {
    if (
      Number.isNaN(Number(formData.amount)) ||
      !formData.date.includes("-")
    )
      return;

    setOpen(true);
    addTransaction({
      ...formData,
      amount: Number(formData.amount),
      id: uuidv4(),
    });
    setFormData(initialState);
    setTranscript("");
  };

  const selectedCategories =
    formData.type === "Income" ? incomeCategories : expenseCategories;

  return (
    <Grid container spacing={2}>
      <Snackbar open={open} setOpen={setOpen} />
      <Grid item xs={12}>
        <Typography align="center" variant="subtitle2" gutterBottom>
          {transcript ? transcript : "Start adding transactions with your voice"}
        </Typography>
      </Grid>

      {/* ✅ Start / Stop buttons */}
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          onClick={startListening}
          fullWidth
          disabled={listening}
        >
          Start
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="secondary"
          onClick={stopListening}
          fullWidth
          disabled={!listening}
        >
          Stop
        </Button>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          >
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            {selectedCategories.map((c) => (
              <MenuItem key={c.type} value={c.type}>
                {c.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="number"
          label="Amount"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: formatDate(e.target.value) })
          }
        />
      </Grid>

      <Button
        className={classes.button}
        variant="outlined"
        color="primary"
        fullWidth
        onClick={createTransaction}
      >
        Create
      </Button>
    </Grid>
  );
};

export default NewTransactionForm;
