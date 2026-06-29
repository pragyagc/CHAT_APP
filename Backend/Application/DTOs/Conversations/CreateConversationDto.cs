using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Conversations
{
    public class CreateConversationDto
    {
        public List<Guid> ParticipantIds { get; set; } = [];
    }
}
