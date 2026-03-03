import { useState } from 'react';
import Home from './pages/Home';
import SocialEducation from './pages/SocialEducation';
import SeniorUniversity from './pages/SeniorUniversity';
import MemberList from './pages/MemberList';
import ProgramManage from './pages/ProgramManage';
import WaitlistPage from './pages/WaitlistPage';

export default function App() {
  const [page, setPage]                   = useState('home');
  const [sheetType, setSheetType]         = useState(null);
  const [editMember, setEditMember]       = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('정상');

  const navigate = (target, options = {}) => {
    setPage(target);
    if (options.sheetType     !== undefined) setSheetType(options.sheetType);
    if (options.editMember    !== undefined) setEditMember(options.editMember);
    if (options.defaultStatus !== undefined) setDefaultStatus(options.defaultStatus || '정상');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {page === 'home'          && <Home navigate={navigate} />}
      {page === 'social'        && <SocialEducation navigate={navigate} editMember={editMember} defaultStatus={defaultStatus} />}
      {page === 'senior'        && <SeniorUniversity navigate={navigate} editMember={editMember} defaultStatus={defaultStatus} />}
      {page === 'memberList'    && <MemberList navigate={navigate} sheetType={sheetType} />}
      {page === 'waitlist'      && <WaitlistPage navigate={navigate} sheetType={sheetType} />}
      {page === 'programManage' && <ProgramManage navigate={navigate} sheetType={sheetType} />}
    </div>
  );
}
