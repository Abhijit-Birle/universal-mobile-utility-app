    const [monthlySummary, setMonthlySummary] = useState("");

    const handleMonthlySummary = async () => {
      setMonthlySummary("Generating summary...");
      try {
        const prompt = `Summarize my tasks for this month based on this data: ${JSON.stringify(todosByDate)}. Keep it to one short paragraph detailing accomplishments and category breakdown.`;
        const res = await fetch("/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
        });
        const data = await res.json();
        setMonthlySummary(data.content[0].text);
      } catch (e) {
        setMonthlySummary("Failed to generate summary.");
        console.error(e);
      }
    };
