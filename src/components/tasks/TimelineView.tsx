// …inside your component, after you’ve built `days` & `months`

const DAY_WIDTH = 40; // px per day, bump this up for readability
const chartWidth = days.length * DAY_WIDTH; // total px width

return (
  <ResizablePanel defaultSize={85} className="min-w-0 overflow-hidden">
    <div className="flex flex-col h-full">
      {/* ONLY this scrolls horizontally */}
      <div className="flex-1 overflow-x-auto">
        {/* this inner div is HUGE (chartWidth px) but its parent scrolls */}
        <div className="relative" style={{ width: chartWidth }}>
          
          {/* Sticky header: months */}
          <div className="sticky top-0 bg-background z-10">
            <div className="flex h-10 border-b">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center border-r text-sm font-medium"
                  style={{ width: m.days * DAY_WIDTH }}
                >
                  {m.month}
                </div>
              ))}
            </div>
            <div className="flex h-10 border-b">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-none flex items-center justify-center border-r ${
                    isToday(d) ? 'bg-blue-100 font-bold' : ''
                  }`}
                  style={{ width: DAY_WIDTH }}
                >
                  <span className="text-xs">{format(d, 'd')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task bars */}
          <div className="relative divide-y">
            {tasks.map((task) => {
              const startDate = task.created_at ? new Date(task.created_at) : new Date();
              const endDate = task.updated_at ? new Date(task.updated_at) : new Date();
              const offsetDays = Math.max(
                0,
                Math.floor(
                  (startDate.getTime() - days[0]!.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );
              const durationDays = Math.max(
                1,
                Math.ceil(
                  (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );

              return (
                <div key={task.id} className="h-[36px] relative">
                  <TimelineTaskBar
                    task={task}
                    style={{
                      left: offsetDays * DAY_WIDTH,
                      width: durationDays * DAY_WIDTH,
                    }}
                    onClick={() => setSelectedTask(task)}
                    durationDays={durationDays}
                    isCompleted={task.status === 'completed'}
                  />
                </div>
              );
            })}

            {/* Today line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-blue-500 z-20"
              style={{
                left: days.findIndex((d) => isToday(d)) * DAY_WIDTH,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </ResizablePanel>
);
