  /* ---------------------------------- PLANNER TAB ---------------------------------- */

  const renderPlannerTab = () => {
    if (plannerSelectedDate) {
      return (
        <div>
          <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <IconBtn size={36} icon={<ChevronLeft size={18} />} onClick={() => setPlannerSelectedDate(null)} />
            <div style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 700, ...fontDisplay }}>
              {new Date(plannerSelectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          {renderTodoTab()}
        </div>
      );
    }

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const daysInMonth = new Date(plannerYear, plannerMonth + 1, 0).getDate();
    const firstDay = new Date(plannerYear, plannerMonth, 1).getDay(); // 0 is Sunday
    
    // Aggregate data
    const todosByDate = {};
    todos.forEach(t => {
      if (t.date) {
        if (!todosByDate[t.date]) todosByDate[t.date] = [];
        todosByDate[t.date].push(t);
      }
    });

    const handleMonthChange = (dir) => {
      if (dir === -1) {
        if (plannerMonth === 0) { setPlannerMonth(11); setPlannerYear(y => y - 1); }
        else setPlannerMonth(m => m - 1);
      } else {
        if (plannerMonth === 11) { setPlannerMonth(0); setPlannerYear(y => y + 1); }
        else setPlannerMonth(m => m + 1);
      }
    };

    const handleBalanceWeek = async () => {
      // AI logic for smart rebalance
      alert("AI Smart Rebalance triggered! (Calling /v1/messages...)");
      try {
        const prompt = `I have these tasks for this month: ${JSON.stringify(todosByDate)}. Please suggest a more balanced week.`;
        const res = await fetch("/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
        });
        const data = await res.json();
        console.log(data);
      } catch (e) {
        console.error(e);
      }
    };

    const handleDrop = (e, dayDateStr) => {
      e.preventDefault();
      const todoId = parseInt(e.dataTransfer.getData("todoId"), 10);
      setTodos(ts => ts.map(t => t.id === todoId ? { ...t, date: dayDateStr } : t));
    };

    return (
      <div style={{ padding: "18px 18px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Toggle */}
        <NeoSurface style={{ display: "flex", padding: 6, borderRadius: 16 }}>
          <button onClick={() => setPlannerView("monthly")} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: plannerView === "monthly" ? theme.bg : "transparent", boxShadow: plannerView === "monthly" ? theme.shadowRaisedSm : "none", color: plannerView === "monthly" ? theme.accent : theme.textSecondary, fontWeight: 700, fontSize: 13, ...fontDisplay, cursor: "pointer" }}>Monthly</button>
          <button onClick={() => setPlannerView("yearly")} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: plannerView === "yearly" ? theme.bg : "transparent", boxShadow: plannerView === "yearly" ? theme.shadowRaisedSm : "none", color: plannerView === "yearly" ? theme.accent : theme.textSecondary, fontWeight: 700, fontSize: 13, ...fontDisplay, cursor: "pointer" }}>Yearly</button>
        </NeoSurface>
        
        {plannerView === "monthly" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: theme.bg, borderRadius: 12, padding: "2px 4px", boxShadow: theme.shadowInset }}>
                <IconBtn size={28} icon={<ChevronLeft size={14} />} onClick={() => handleMonthChange(-1)} />
                <div style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: 13, color: theme.textPrimary, ...fontDisplay }}>{monthNames[plannerMonth]}</div>
                <IconBtn size={28} icon={<ChevronRight size={14} />} onClick={() => handleMonthChange(1)} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: theme.bg, borderRadius: 12, padding: "2px 4px", boxShadow: theme.shadowInset }}>
                <IconBtn size={28} icon={<ChevronLeft size={14} />} onClick={() => setPlannerYear(y => y - 1)} />
                <div style={{ width: 45, textAlign: "center", fontWeight: 700, fontSize: 13, color: theme.textPrimary, ...fontDisplay }}>{plannerYear}</div>
                <IconBtn size={28} icon={<ChevronRight size={14} />} onClick={() => setPlannerYear(y => y + 1)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: theme.textSecondary, ...fontBody }}>{d}</div>
              ))}
              
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = String(day).padStart(2, '0');
                const mStr = String(plannerMonth + 1).padStart(2, '0');
                const dateStr = `${plannerYear}-${mStr}-${dStr}`;
                const dayTodos = todosByDate[dateStr] || [];
                const hasWork = dayTodos.some(t => autoCategorizeTodo(t.text) === 'Work');
                const hasStudy = dayTodos.some(t => autoCategorizeTodo(t.text) === 'Study');
                const hasPersonal = dayTodos.some(t => autoCategorizeTodo(t.text) === 'Personal');
                
                return (
                  <button key={day} 
                    onClick={() => setPlannerSelectedDate(dateStr)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    style={{
                    aspectRatio: "1", borderRadius: 10, border: "none", background: theme.bg,
                    boxShadow: theme.shadowRaisedSm,
                    color: theme.textPrimary, fontSize: 15, fontWeight: 600, position: "relative", cursor: "pointer", ...fontBody,
                  }}>
                    {day}
                    <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 2 }}>
                      {hasWork && <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.accent }} />}
                      {hasStudy && <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.accent2 }} />}
                      {hasPersonal && <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.danger }} />}
                    </div>
                  </button>
                )
              })}
            </div>
            
            <button onClick={handleBalanceWeek} style={{ marginTop: 24, width: "100%", padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${theme.accent}, #5a4fcf)`, color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...fontDisplay, cursor: "pointer" }}>
              <Sparkles size={16} /> Balance My Week
            </button>
          </div>
        )}

        {plannerView === "yearly" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {monthNames.map((m, i) => {
              // rough density calculation for the whole month
              const monthPrefix = `${plannerYear}-${String(i + 1).padStart(2, '0')}`;
              const count = todos.filter(t => t.date && t.date.startsWith(monthPrefix)).length;
              const intensity = Math.min(count / 10, 1); // just a simple scale for heatmap
              
              return (
                <button key={m} onClick={() => { setPlannerMonth(i); setPlannerView("monthly"); }} style={{
                  aspectRatio: "1", borderRadius: 12, border: "none", background: theme.bg,
                  boxShadow: theme.shadowRaisedSm, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", ...fontBody
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary }}>{m}</div>
                  <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>{count} tasks</div>
                  <div style={{ position: "absolute", bottom: 8, width: "60%", height: 4, borderRadius: 2, background: theme.accent, opacity: intensity || 0.1 }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

