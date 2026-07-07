    const addTodo = async () => {
      if (!todoInput.trim()) return;
      
      let finalDate = (activeTab === "planner" && plannerSelectedDate) ? plannerSelectedDate : new Date().toISOString().split('T')[0];
      let finalText = todoInput.trim();
      let isAiLoading = false;

      // Natural language add in planner
      if (activeTab === "planner") {
         isAiLoading = true;
         try {
           const prompt = `Parse this task: "${finalText}". Return JSON only: {"text": "Cleaned task text", "date": "YYYY-MM-DD" (or null if not specified)}. Current year: ${new Date().getFullYear()}, Current month: ${new Date().getMonth()+1}, Current day: ${new Date().getDate()}`;
           const res = await fetch("/v1/messages", {
             method: "POST", headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
           });
           if (res.ok) {
             const data = await res.json();
             const parsed = JSON.parse(data.content[0].text.match(/\{.*\}/s)[0]);
             if (parsed.date) finalDate = parsed.date;
             if (parsed.text) finalText = parsed.text;
           }
         } catch(e) {
           console.error("AI parse failed", e);
         }
      }
      
      setTodos((t) => [{ id: Date.now(), text: finalText, done: false, priority: newPriority, date: finalDate, due: null, reminder: false, recurring: newRecurringDays.length ? newRecurringDays : null, subtasks: [] }, ...t]);
      setTodoInput(""); setNewPriority("Medium"); setNewRecurringDays([]); setShowTaskOptions(false);
    };
