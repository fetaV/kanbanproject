import React, { useState, useEffect } from "react"
import axios from "axios"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import MenuComponent from "./MenuComponent"

const DashboardComponent = () => {
  const [dashboard, setDashboard] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [editTaskFormData, setEditTaskFormData] = useState({
    name: "",
    description: "",
  })

  const handleEditTask = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        `https://api.management.parse25proje.link/api/tasks/${editTaskId}`,
        editTaskFormData,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      console.log("Görev güncellendi:", response.data)
      setEditTaskId(null)
    } catch (error) {
      console.error("Hata:", error)
    }
  }

  const handleDeleteTask = async taskId => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(
        `https://api.management.parse25proje.link/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      )

      setDashboard(prevDashboard => {
        const newDashboard = prevDashboard.map(board => ({
          ...board,
          tasks: board.tasks.filter(task => task.id !== taskId),
        }))
        return newDashboard
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          "https://api.management.parse25proje.link/api/boards",
          {
            headers: {
              Authorization: token,
            },
          }
        )
        console.log(response.data.data)
        setDashboard(response.data.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTasks()
  }, [])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const handleDragEnd = result => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newDashboard = [...dashboard]
    const sourceColumn = newDashboard.find(
      column => column.name === source.droppableId
    )
    const destinationColumn = newDashboard.find(
      column => column.name === destination.droppableId
    )
    const draggedTask = sourceColumn.tasks.find(
      task => task.id.toString() === draggableId
    )
    sourceColumn.tasks.splice(source.index, 1)
    destinationColumn.tasks.splice(destination.index, 0, draggedTask)
    setDashboard(newDashboard)
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    boardId: Number,
    flagId: 0,
  })

  const handleChange = e => {
    const { name, value } = e.target

    // Sadece sayı değerlerini kabul et
    if (name === "boardId" && isNaN(value)) {
      return
    }

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAdd = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "https://api.management.parse25proje.link/api/tasks",
        {
          ...formData,
          boardId: 1,
          flagId: findNextFlagId(),
          startDate: formData.startDate
            ? format(
                new Date(formData.startDate),
                "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
              )
            : null,
          endDate: formData.endDate
            ? format(new Date(formData.endDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
            : null,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      console.log("Yeni task oluşturuldu:", response.data)
      setFormData({
        name: "",
        description: "",
        boardId: 0,
        flagId: 0,
      })
    } catch (error) {
      console.error("Hata:", error)
    }
  }

  const findNextFlagId = () => {
    const flagIds = dashboard.reduce((acc, board) => {
      return acc.concat(board.tasks.map(task => task.flagId))
    }, [])

    const maxFlagId = Math.max(...flagIds)

    return maxFlagId + 1
  }

  return (
    <>
      <MenuComponent menuOpen={menuOpen} toggleMenu={toggleMenu} />

      <div
        className={`ml-0 transition-all duration-300 ease-in-out ${
          menuOpen ? "ml-64" : ""
        }`}
      >
        <header className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
          <button onClick={toggleMenu} className="block">
            {menuOpen ? "kargakarga" : "kargakarga"}
          </button>
        </header>
        <div className="container mx-auto py-8 px-4">
          <form onSubmit={handleAdd}>
            <div>
              <label>Task Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <button type="submit">Create Task</button>
          </form>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex">
              {dashboard.map(board => (
                <div key={board.id} className="flex-1 p-4">
                  <h2 className="text-xl font-bold mb-4">{board.name}</h2>
                  <Droppable droppableId={board.name} key={board.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-gray-200 p-2 rounded"
                      >
                        {board.tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-2 rounded mb-2"
                              >
                                <p>{task.name}</p>
                                <button
                                  onClick={() => {
                                    // Edit butonuna tıkladığımızda düzenleme modalını aç
                                    setEditTaskId(task.id)
                                    setEditTaskFormData({
                                      name: task.name,
                                      description: task.description,
                                    })
                                  }}
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                  Sil
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
          {editTaskId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Görev Düzenle</h2>
                <form onSubmit={handleEditTask}>
                  <div className="mb-4">
                    <label className="block">Görev Adı:</label>
                    <input
                      type="text"
                      name="name"
                      value={editTaskFormData.name}
                      onChange={e =>
                        setEditTaskFormData({
                          ...editTaskFormData,
                          name: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-1 w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block">Açıklama:</label>
                    <input
                      type="text"
                      name="description"
                      value={editTaskFormData.description}
                      onChange={e =>
                        setEditTaskFormData({
                          ...editTaskFormData,
                          description: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-1 w-full"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setEditTaskId(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardComponent
