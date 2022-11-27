import { useState } from 'react'
import bg from '../../assets/images/bg.jpg'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import './RoomPortal.css'
const RoomPortal = () => {

    
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState(null);
    const [username, setUsername] = useState(null);
    return (
        <div className='portal-wrapper'>
            <img src={bg} alt="" className='portal-wrapper-bg' />
            <div className='portal'>
                <h1> Create\Join room</h1>
               <div>
               <input
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter username"
                    name=""
                    id=""
                />
                <input
                    onChange={(e) => {
                        setRoomId(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter room code"
                    name=""
                    id=""
                />
               </div>
                <button
                    onClick={() => {
                        if (!(username && roomId)) {
                            toast.error("Username and room id is required");
                            return;
                        }
                        navigate('/multiplayer', {
                            state: {
                                username, roomId,from:"/roomportal"
                            }
                        })

                    }}
                >
                    Create
                </button>
            </div>
        </div>
    );
}

export default RoomPortal