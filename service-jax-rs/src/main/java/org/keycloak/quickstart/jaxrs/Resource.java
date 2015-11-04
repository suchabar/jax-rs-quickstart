package org.keycloak.quickstart.jaxrs;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

@Path("/")
public class Resource
{
    public HashMap<Integer, String> msgs = new HashMap<Integer, String>();
    public Resource()
    {
        for (int i = 0; i < 4; i++) msgs.put(new Integer(i), "Message " + i);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("public")
    public Message getPublic() {
        return new Message("public");
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("secured")
    public Message getSecured() {
        return new Message("secured");
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("admin")
    public Message getAdmin() {
        return new Message("admin");
    }

    // /echo?value="HelloWorld"
    @GET
    @Produces("text/plain")
    @Path("echo")
    public String echo(@QueryParam("value") String value)
    {
        return value;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{role-name}")
    public Message getRole(@PathParam("role-name") String roleName)
    {
        return new Message(roleName);
    }

    //CRUD
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("messages")
    public HashMap<Integer,String> getMessages()
    {
        return msgs;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("messages")
    public Response createMessage(Message msg)
    {
        msgs.put(new Integer(msg.getId()), msg.getMessage());
        return Response.status(201).entity("Message created : " + "id - " + msg.getId() + "msg - " + msg.getMessage()).build();
    }

    @GET
    @Produces("text/plain")
    @Path("messages/{id}")
    public String getMessage(@PathParam("id") int id)
    {
       return msgs.get(id);
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("messages/{id}")
    public Response updateMessage(@PathParam("id") int id, Message msg)
    {
        msgs.replace(msg.getId(), msg.getMessage());
        return Response.status(200).entity("Message updated : " + "id - " + msg.getId() + "msg - " + msg.getMessage()).build();
    }

    @DELETE
    @Path("messages/{id}")
    public Response deleteMessage(@PathParam("id") int id)
    {
        msgs.remove(id);
        return Response.status(200).entity("Message removed : " + "id - " + id).build();

    }
}
